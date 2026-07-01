"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { applySaveResult, postAdminSave } from "@/lib/admin/save-client";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import {
  isDefaultOverviewLabel,
  mergeOverviewInfoCards,
  updateOverviewCardValue,
} from "@/lib/project-content/overview-info-cards";
import type { OverviewInfoCard, ProjectOverview } from "@/lib/types/project-content";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminDangerButtonClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type OverviewManagerProps = {
  initialData: ProjectOverview | null;
};

export default function OverviewManager({ initialData }: OverviewManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, setToast } = useAdminToast();

  const [sectionTitle, setSectionTitle] = useState(
    initialData?.section_title ?? "사업개요",
  );
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [infoCards, setInfoCards] = useState<OverviewInfoCard[]>(() =>
    mergeOverviewInfoCards(initialData?.info_cards),
  );
  const [isSaving, setIsSaving] = useState(false);

  const displayImage = previewUrl ?? imageUrl;
  const defaultCards = infoCards.filter((card) => isDefaultOverviewLabel(card.label));
  const customCards = infoCards.filter((card) => !isDefaultOverviewLabel(card.label));

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function updateDefaultValue(label: string, value: string) {
    setInfoCards((prev) => updateOverviewCardValue(prev, label, value));
  }

  function updateCustomCard(index: number, field: "label" | "value", value: string) {
    setInfoCards((prev) => {
      const custom = prev.filter((card) => !isDefaultOverviewLabel(card.label));
      const defaults = prev.filter((card) => isDefaultOverviewLabel(card.label));
      const nextCustom = custom.map((card, i) =>
        i === index ? { ...card, [field]: value } : card,
      );
      return [...defaults, ...nextCustom];
    });
  }

  function addCustomCard() {
    setInfoCards((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "항목", value: "" },
    ]);
  }

  function removeCustomCard(index: number) {
    setInfoCards((prev) => {
      const custom = prev.filter((card) => !isDefaultOverviewLabel(card.label));
      const defaults = prev.filter((card) => isDefaultOverviewLabel(card.label));
      return [...defaults, ...custom.filter((_, i) => i !== index)];
    });
  }

  async function handleSave() {
    console.log("Save button clicked");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("section_title", sectionTitle);
      formData.append("description", description);
      formData.append("info_cards", JSON.stringify(infoCards));
      if (imageUrl) formData.append("existing_image_url", imageUrl);
      if (selectedFile) formData.append("image", selectedFile);

      const result = await postAdminSave<ProjectOverview>("overview", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setSectionTitle(result.data.section_title);
        setDescription(result.data.description);
        setInfoCards(mergeOverviewInfoCards(result.data.info_cards));
        setImageUrl(result.data.image_url);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        broadcastProjectContent("overview");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[OverviewManager] handleSave failed:", error);
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="사업개요 관리"
      description="대표 이미지, 세부설명, 사업정보를 수정합니다."
    >
      <AdminToast toast={toast} />

      <div className="mx-auto max-w-3xl space-y-6">
        <section className={adminCardClass}>
          <div className="mb-4">
            <label className={adminLabelClass} htmlFor="overview-section-title">
              섹션 제목
            </label>
            <input
              id="overview-section-title"
              className={adminInputClass}
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-3">
            <label className={adminLabelClass}>대표 이미지</label>
            {displayImage ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-navy/5">
                <Image
                  src={displayImage}
                  alt="사업개요 대표 이미지"
                  fill
                  unoptimized={isExternalUrl(displayImage)}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-light-gray text-sm text-navy/40">
                등록된 이미지 없음
              </div>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-6 py-6 transition-colors hover:border-gold/40 sm:py-8">
              <Upload className="mb-2 text-navy/40" size={24} />
              <span className="text-sm text-navy/70">클릭하여 이미지 선택</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </section>

        <section className={adminCardClass}>
          <label className={adminLabelClass} htmlFor="overview-description">
            세부설명
          </label>
          <textarea
            id="overview-description"
            className={adminTextareaClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            dir="ltr"
            placeholder="사업에 대한 상세 설명을 입력하세요."
          />
        </section>

        <section className={adminCardClass}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-navy">사업정보</h2>
              <p className="mt-1 text-xs text-navy/50">
                사업명, 위치, 규모, 세대수, 시공사 정보를 입력하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomCard}
              className={`${adminSecondaryButtonClass} shrink-0 self-start`}
            >
              <Plus size={14} className="inline" /> 항목 추가
            </button>
          </div>

          <div className="space-y-4">
            {defaultCards.map((card) => (
              <div
                key={card.id}
                className="grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center"
              >
                <label
                  className="text-sm font-semibold text-navy sm:pt-0"
                  htmlFor={`overview-info-${card.id}`}
                >
                  {card.label}
                </label>
                <input
                  id={`overview-info-${card.id}`}
                  className={adminInputClass}
                  value={card.value}
                  onChange={(e) => updateDefaultValue(card.label, e.target.value)}
                  dir="ltr"
                  placeholder={`${card.label} 입력`}
                />
              </div>
            ))}

            {customCards.length > 0 && (
              <div className="space-y-3 border-t border-navy/10 pt-4">
                <p className="text-xs font-semibold text-navy/50">추가 항목</p>
                {customCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <input
                      className={`${adminInputClass} sm:w-28 sm:shrink-0`}
                      value={card.label}
                      onChange={(e) => updateCustomCard(index, "label", e.target.value)}
                      placeholder="항목명"
                      dir="ltr"
                    />
                    <input
                      className={adminInputClass}
                      value={card.value}
                      onChange={(e) => updateCustomCard(index, "value", e.target.value)}
                      placeholder="내용"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomCard(index)}
                      className={`${adminDangerButtonClass} inline-flex shrink-0 items-center justify-center self-start p-2.5 sm:self-center`}
                      aria-label="항목 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end pb-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`${adminPrimaryButtonClass} w-full sm:w-auto`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            저장
          </button>
        </div>
      </div>
    </AdminPageShell>
  );
}
