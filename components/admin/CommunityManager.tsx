"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Plus, Trash2, Upload } from "lucide-react";
import {
  applySaveResult,
  postAdminJsonSave,
  postAdminSave,
} from "@/lib/admin/save-client";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import type { ProjectCommunityItem } from "@/lib/types/project-content";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminDangerButtonClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type CommunityManagerProps = {
  initialItems: ProjectCommunityItem[];
};

type DraftState = {
  title: string;
  subtitle: string;
  description: string;
  file: File | null;
  preview: string | null;
};

function emptyDraft(): DraftState {
  return {
    title: "",
    subtitle: "",
    description: "",
    file: null,
    preview: null,
  };
}

export default function CommunityManager({ initialItems }: CommunityManagerProps) {
  const router = useRouter();
  const { toast, setToast } = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [newDraft, setNewDraft] = useState<DraftState>(emptyDraft());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function getDraft(item: ProjectCommunityItem): DraftState {
    return (
      drafts[item.id] ?? {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        file: null,
        preview: null,
      }
    );
  }

  async function saveItem(item: ProjectCommunityItem | null) {
    console.log("Save button clicked");
    console.log("Saving community...");

    const key = item?.id ?? "new";
    setSavingId(key);

    try {
      const draft = item ? getDraft(item) : newDraft;
      const payload = {
        itemId: item?.id ?? null,
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        sortOrder: item?.sort_order ?? items.length,
        hasNewImage: Boolean(draft.file),
        existingImageUrl: item?.image_url ?? null,
      };
      console.log("Payload:", payload);

      const formData = new FormData();
      if (item) formData.append("item_id", item.id);
      formData.append("title", draft.title);
      formData.append("subtitle", draft.subtitle);
      formData.append("description", draft.description);
      formData.append("sort_order", String(item?.sort_order ?? items.length));
      if (item?.image_url) formData.append("existing_image_url", item.image_url);
      if (draft.file) formData.append("image", draft.file);

      const result = await postAdminSave<ProjectCommunityItem[]>("community", formData);
      console.log("Supabase Response:", result);

      if (applySaveResult(result, setToast) && result.data) {
        setItems(result.data);
        if (item) {
          setDrafts((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
        } else {
          setNewDraft(emptyDraft());
        }
        broadcastProjectContent("community");
        router.refresh();
      } else if (!result.success) {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[CommunityManager] saveItem failed:", error);
      setToast({ type: "error", message });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(itemId: string) {
    const result = await postAdminJsonSave<ProjectCommunityItem[]>("community-delete", {
      itemId,
    });
    if (applySaveResult(result, setToast) && result.data) {
      setItems(result.data);
      broadcastProjectContent("community");
      router.refresh();
    }
  }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const current = [...items];
    const fromIndex = current.findIndex((item) => item.id === dragId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    const result = await postAdminJsonSave<ProjectCommunityItem[]>("community-reorder", {
      orderedIds: current.map((item) => item.id),
    });
    if (result.success && result.data) {
      setItems(result.data);
      broadcastProjectContent("community");
      router.refresh();
    }
    setDragId(null);
  }

  function renderForm(
    draft: DraftState,
    onChange: (patch: Partial<DraftState>) => void,
    item: ProjectCommunityItem | null,
    onSave: () => void,
    saving: boolean,
  ) {
    const imageSrc = draft.preview ?? item?.image_url ?? null;

    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-light-gray">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={draft.title || "커뮤니티 시설"}
              fill
              unoptimized={isExternalUrl(imageSrc)}
              className="object-cover"
              sizes="400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-navy/40">
              대표 이미지 없음
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className={adminLabelClass}>시설명</label>
            <input
              className={adminInputClass}
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="피트니스센터"
              dir="ltr"
            />
          </div>
          <div>
            <label className={adminLabelClass}>한 줄 설명</label>
            <input
              className={adminInputClass}
              value={draft.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="최신 운동기구를 갖춘 프리미엄 피트니스 공간"
              dir="ltr"
            />
          </div>
          <div>
            <label className={adminLabelClass}>상세 설명</label>
            <textarea
              className={adminTextareaClass}
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="시설에 대한 상세 설명을 입력하세요."
              dir="ltr"
            />
          </div>
          <div>
            <label className={adminLabelClass}>대표 이미지</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onChange({ file, preview: URL.createObjectURL(file) });
              }}
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className={adminPrimaryButtonClass}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPageShell
      title="단지 커뮤니티 관리"
      description="커뮤니티 시설을 추가·수정·삭제하고 순서를 변경합니다."
    >
      <AdminToast toast={toast} />

      <div className="space-y-4">
        {items.map((item) => {
          const draft = getDraft(item);
          return (
            <section
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              className={`${adminCardClass} cursor-grab active:cursor-grabbing`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <GripVertical size={18} className="shrink-0 text-navy/40" />
                  <h3 className="truncate text-sm font-semibold text-navy">
                    {item.title || "시설명 미입력"}
                  </h3>
                </div>
                <button
                  type="button"
                  className={adminDangerButtonClass}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {renderForm(
                draft,
                (patch) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [item.id]: { ...draft, ...patch },
                  })),
                item,
                () => saveItem(item),
                savingId === item.id,
              )}
            </section>
          );
        })}

        <section className={adminCardClass}>
          <h3 className="mb-4 text-sm font-semibold text-navy">새 시설 추가</h3>
          {renderForm(
            newDraft,
            (patch) => setNewDraft((prev) => ({ ...prev, ...patch })),
            null,
            () => saveItem(null),
            savingId === "new",
          )}
          <button
            type="button"
            disabled={savingId === "new"}
            onClick={() => saveItem(null)}
            className={`${adminPrimaryButtonClass} mt-4`}
          >
            {savingId === "new" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            시설 추가
          </button>
        </section>
      </div>
    </AdminPageShell>
  );
}
