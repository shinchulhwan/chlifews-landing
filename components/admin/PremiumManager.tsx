"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  applySaveResult,
  postAdminJsonSave,
  postAdminSave,
} from "@/lib/admin/save-client";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import type { ProjectPremiumCard, ProjectPremiumData } from "@/lib/types/project-content";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminDangerButtonClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type PremiumManagerProps = {
  initialData: ProjectPremiumData;
};

export default function PremiumManager({ initialData }: PremiumManagerProps) {
  const router = useRouter();
  const { toast, setToast } = useAdminToast();
  const [data, setData] = useState(initialData);
  const [sectionTitle, setSectionTitle] = useState(initialData.section.section_title);
  const [sectionDescription, setSectionDescription] = useState(
    initialData.section.section_description,
  );
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [draftCards, setDraftCards] = useState<
    Record<string, { title: string; description: string; file: File | null; preview: string | null }>
  >({});

  function getDraft(card: ProjectPremiumCard) {
    return (
      draftCards[card.id] ?? {
        title: card.title,
        description: card.description,
        file: null,
        preview: null,
      }
    );
  }

  function updateDraft(
    cardId: string,
    patch: Partial<{ title: string; description: string; file: File | null; preview: string | null }>,
    fallback?: ProjectPremiumCard,
  ) {
    setDraftCards((prev) => ({
      ...prev,
      [cardId]: {
        title: patch.title ?? prev[cardId]?.title ?? fallback?.title ?? "",
        description:
          patch.description ?? prev[cardId]?.description ?? fallback?.description ?? "",
        file: patch.file !== undefined ? patch.file : (prev[cardId]?.file ?? null),
        preview:
          patch.preview !== undefined ? patch.preview : (prev[cardId]?.preview ?? null),
      },
    }));
  }

  async function handleSaveSection() {
    console.log("Save button clicked");
    setIsSavingSection(true);
    try {
      const formData = new FormData();
      formData.append("section_title", sectionTitle);
      formData.append("section_description", sectionDescription);
      const result = await postAdminSave<ProjectPremiumData>("premium-section", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setData(result.data);
        broadcastProjectContent("premium");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[PremiumManager] handleSaveSection failed:", error);
      setToast({ type: "error", message });
    } finally {
      setIsSavingSection(false);
    }
  }

  async function handleSaveCard(card: ProjectPremiumCard | null, isNew = false) {
    console.log("Save button clicked");
    const cardKey = card?.id ?? "new";
    setSavingCardId(cardKey);

    try {
      const draft = card
        ? getDraft(card)
        : draftCards.new ?? { title: "", description: "", file: null, preview: null };

      const formData = new FormData();
      if (card) formData.append("card_id", card.id);
      formData.append("title", draft.title);
      formData.append("description", draft.description);
      formData.append("sort_order", String(card?.sort_order ?? data.cards.length));
      if (card?.image_url) formData.append("existing_image_url", card.image_url);
      if (draft.file) formData.append("image", draft.file);

      const result = await postAdminSave<ProjectPremiumData>("premium-card", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setData(result.data);
        if (isNew) {
          setDraftCards((prev) => {
            const next = { ...prev };
            delete next.new;
            return next;
          });
        }
        broadcastProjectContent("premium");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[PremiumManager] handleSaveCard failed:", error);
      setToast({ type: "error", message });
    } finally {
      setSavingCardId(null);
    }
  }

  async function handleDelete(cardId: string) {
    const result = await postAdminJsonSave<ProjectPremiumData>("premium-delete", { cardId });
    if (applySaveResult(result, setToast) && result.data) {
      setData(result.data);
      broadcastProjectContent("premium");
      router.refresh();
    }
  }

  async function moveCard(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= data.cards.length) return;
    const ordered = [...data.cards];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const result = await postAdminJsonSave<ProjectPremiumData>("premium-reorder", {
      orderedIds: ordered.map((c) => c.id),
    });
    if (result.success && result.data) {
      setData(result.data);
      broadcastProjectContent("premium");
      router.refresh();
    }
  }

  return (
    <AdminPageShell
      title="프리미엄 / 미래가치 관리"
      description="섹션 제목, 설명, 프리미엄 카드를 관리합니다."
    >
      <AdminToast toast={toast} />

      <section className={`${adminCardClass} mb-6`}>
        <h2 className="mb-4 text-sm font-semibold text-navy">섹션 설정</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={adminLabelClass}>섹션 제목</label>
            <input
              className={adminInputClass}
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
          </div>
          <div>
            <label className={adminLabelClass}>설명</label>
            <textarea
              className={`${adminInputClass} min-h-[80px] resize-y`}
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          disabled={isSavingSection}
          onClick={handleSaveSection}
          className={`${adminPrimaryButtonClass} mt-4`}
        >
          {isSavingSection ? <Loader2 size={16} className="animate-spin" /> : null}
          섹션 저장
        </button>
      </section>

      <div className="space-y-4">
        {data.cards.map((card, index) => {
          const draft = getDraft(card);
          const imageSrc = draft.preview ?? card.image_url;

          return (
            <section key={card.id} className={adminCardClass}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-navy">카드 {index + 1}</h3>
                <div className="flex gap-2">
                  <button type="button" className={adminSecondaryButtonClass} onClick={() => moveCard(index, -1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" className={adminSecondaryButtonClass} onClick={() => moveCard(index, 1)}>
                    <ArrowDown size={14} />
                  </button>
                  <button type="button" className={adminDangerButtonClass} onClick={() => handleDelete(card.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-light-gray">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={draft.title}
                      fill
                      unoptimized={isExternalUrl(imageSrc)}
                      className="object-cover"
                      sizes="400px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-navy/40">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={adminLabelClass}>카드 제목</label>
                    <input
                      className={adminInputClass}
                      value={draft.title}
                      onChange={(e) => updateDraft(card.id, { title: e.target.value }, card)}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>카드 설명</label>
                    <textarea
                      className={`${adminInputClass} min-h-[80px] resize-y`}
                      value={draft.description}
                      onChange={(e) => updateDraft(card.id, { description: e.target.value }, card)}
                    />
                  </div>
                  <input
                    ref={(el) => { fileRefs.current[card.id] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      updateDraft(card.id, {
                        file,
                        preview: URL.createObjectURL(file),
                      }, card);
                    }}
                  />
                  <button
                    type="button"
                    disabled={savingCardId === card.id}
                    onClick={() => handleSaveCard(card)}
                    className={adminPrimaryButtonClass}
                  >
                    {savingCardId === card.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    저장
                  </button>
                </div>
              </div>
            </section>
          );
        })}

        <section className={adminCardClass}>
          <h3 className="mb-4 text-sm font-semibold text-navy">새 카드 추가</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={adminLabelClass}>카드 제목</label>
              <input
                className={adminInputClass}
                value={draftCards.new?.title ?? ""}
                onChange={(e) => updateDraft("new", { title: e.target.value })}
              />
            </div>
            <div>
              <label className={adminLabelClass}>카드 설명</label>
              <textarea
                className={`${adminInputClass} min-h-[80px] resize-y`}
                value={draftCards.new?.description ?? ""}
                onChange={(e) => updateDraft("new", { description: e.target.value })}
              />
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="mt-3 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              updateDraft("new", { file, preview: URL.createObjectURL(file) });
            }}
          />
          <button
            type="button"
            disabled={savingCardId === "new"}
            onClick={() => handleSaveCard(null, true)}
            className={`${adminPrimaryButtonClass} mt-4`}
          >
            {savingCardId === "new" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            카드 추가
          </button>
        </section>
      </div>
    </AdminPageShell>
  );
}
