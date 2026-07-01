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
import { applySaveResult, postAdminSave } from "@/lib/admin/save-client";
import { LOCATION_ICON_OPTIONS, resolveLocationIcon } from "@/lib/project-content/icons";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import type { LocationPoint, ProjectLocation } from "@/lib/types/project-content";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type LocationManagerProps = {
  initialData: ProjectLocation | null;
};

function createPoint(sortOrder: number): LocationPoint {
  return {
    id: crypto.randomUUID(),
    icon: "MapPin",
    title: "",
    description: "",
    sort_order: sortOrder,
  };
}

export default function LocationManager({ initialData }: LocationManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, setToast } = useAdminToast();

  const [sectionTitle, setSectionTitle] = useState(
    initialData?.section_title ?? "입지환경",
  );
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(
    initialData?.main_image_url ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [points, setPoints] = useState<LocationPoint[]>(
    initialData?.points?.length ? initialData.points : [createPoint(0)],
  );
  const [isSaving, setIsSaving] = useState(false);

  const displayImage = previewUrl ?? mainImageUrl;

  function updatePoint(index: number, patch: Partial<LocationPoint>) {
    setPoints((prev) =>
      prev.map((point, i) => (i === index ? { ...point, ...patch } : point)),
    );
  }

  function addPoint() {
    setPoints((prev) => [...prev, createPoint(prev.length)]);
  }

  function removePoint(index: number) {
    setPoints((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((point, i) => ({ ...point, sort_order: i })),
    );
  }

  function movePoint(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= points.length) return;
    const next = [...points];
    [next[index], next[target]] = [next[target], next[index]];
    setPoints(next.map((point, i) => ({ ...point, sort_order: i })));
  }

  async function handleSave() {
    console.log("Save button clicked");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("section_title", sectionTitle);
      formData.append("points", JSON.stringify(points));
      if (mainImageUrl) formData.append("existing_image_url", mainImageUrl);
      if (selectedFile) formData.append("image", selectedFile);

      const result = await postAdminSave<ProjectLocation>("location", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setMainImageUrl(result.data.main_image_url);
        setPoints(result.data.points);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        broadcastProjectContent("location");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[LocationManager] handleSave failed:", error);
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="입지환경 관리"
      description="섹션 제목, 메인 이미지, 입지 포인트를 관리합니다."
    >
      <AdminToast toast={toast} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${adminCardClass} overflow-hidden p-0`}>
          <div className="border-b border-navy/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">현재 미리보기</h2>
          </div>
          {displayImage ? (
            <div className="relative aspect-[16/9] w-full bg-navy/5">
              <Image
                src={displayImage}
                alt="입지환경 메인 이미지"
                fill
                unoptimized={isExternalUrl(displayImage)}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-light-gray text-sm text-navy/40">
              메인 이미지 없음
            </div>
          )}
          <div className="space-y-3 px-5 py-4">
            <p className="text-lg font-semibold text-navy">{sectionTitle}</p>
            {points.map((point) => {
              const Icon = resolveLocationIcon(point.icon);
              return (
                <div key={point.id} className="flex gap-3 rounded-xl bg-light-gray p-3">
                  <Icon className="mt-0.5 shrink-0 text-gold" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-navy">{point.title || "제목"}</p>
                    <p className="text-xs text-navy/60">{point.description || "설명"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={adminCardClass}>
          <h2 className="mb-4 text-sm font-semibold text-navy">내용 수정</h2>
          <div className="space-y-4">
            <div>
              <label className={adminLabelClass}>섹션 제목</label>
              <input
                className={adminInputClass}
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={adminLabelClass}>메인 이미지</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-6 py-8">
                <Upload className="mb-2 text-navy/40" size={24} />
                <span className="text-sm text-navy/70">클릭하여 이미지 선택</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }}
                />
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={adminLabelClass}>입지 포인트</label>
                <button type="button" onClick={addPoint} className={adminSecondaryButtonClass}>
                  <Plus size={14} className="inline" /> 추가
                </button>
              </div>
              <div className="space-y-3">
                {points.map((point, index) => (
                  <div key={point.id} className="rounded-xl border border-navy/10 p-3">
                    <div className="mb-2 flex justify-end gap-2">
                      <button type="button" className={adminSecondaryButtonClass} onClick={() => movePoint(index, -1)}>
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" className={adminSecondaryButtonClass} onClick={() => movePoint(index, 1)}>
                        <ArrowDown size={14} />
                      </button>
                      <button type="button" className={adminSecondaryButtonClass} onClick={() => removePoint(index)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <select
                      className={adminInputClass}
                      value={point.icon}
                      onChange={(e) => updatePoint(index, { icon: e.target.value })}
                    >
                      {LOCATION_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={`${adminInputClass} mt-2`}
                      value={point.title}
                      onChange={(e) => updatePoint(index, { title: e.target.value })}
                      placeholder="제목"
                    />
                    <textarea
                      className={`${adminInputClass} mt-2 min-h-[60px] resize-y`}
                      value={point.description}
                      onChange={(e) => updatePoint(index, { description: e.target.value })}
                      placeholder="설명"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`${adminPrimaryButtonClass} mt-6`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            저장
          </button>
        </section>
      </div>
    </AdminPageShell>
  );
}
