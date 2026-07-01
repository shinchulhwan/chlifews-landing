"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Star, Trash2, Upload } from "lucide-react";
import {
  applySaveResult,
  postAdminJsonSave,
  postAdminSave,
} from "@/lib/admin/save-client";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import type { ProjectGalleryItem } from "@/lib/types/project-content";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminDangerButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type GalleryManagerProps = {
  initialItems: ProjectGalleryItem[];
};

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, setToast } = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [localPreviews, setLocalPreviews] = useState<
    { id: string; url: string; name: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const previews = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setLocalPreviews((prev) => [...prev, ...previews]);
    setToast(null);
  }

  async function handleUpload() {
    console.log("Save button clicked");
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) {
      setToast({ type: "error", message: "업로드할 이미지를 선택해 주세요." });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      Array.from(fileInput.files).forEach((file) => formData.append("files", file));

      const result = await postAdminSave<ProjectGalleryItem[]>("gallery-upload", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setItems(result.data);
        localPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        setLocalPreviews([]);
        fileInput.value = "";
        broadcastProjectContent("gallery");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.";
      console.error("[GalleryManager] handleUpload failed:", error);
      setToast({ type: "error", message });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(itemId: string) {
    const result = await postAdminJsonSave<ProjectGalleryItem[]>("gallery-delete", {
      itemId,
    });
    if (applySaveResult(result, setToast) && result.data) {
      setItems(result.data);
      broadcastProjectContent("gallery");
      router.refresh();
    }
  }

  async function handleSetFeatured(itemId: string) {
    const result = await postAdminJsonSave<ProjectGalleryItem[]>("gallery-featured", {
      itemId,
    });
    if (applySaveResult(result, setToast) && result.data) {
      setItems(result.data);
      broadcastProjectContent("gallery");
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

    const result = await postAdminJsonSave<ProjectGalleryItem[]>("gallery-reorder", {
      orderedIds: current.map((item) => item.id),
    });
    if (result.success && result.data) {
      setItems(result.data);
      broadcastProjectContent("gallery");
      router.refresh();
    }
    setDragId(null);
  }

  return (
    <AdminPageShell
      title="갤러리 관리"
      description="이미지를 업로드하고 순서 변경, 대표 이미지를 설정합니다."
    >
      <AdminToast toast={toast} />

      <section className={`${adminCardClass} mb-6`}>
        <h2 className="mb-4 text-sm font-semibold text-navy">새 이미지 업로드</h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-6 py-10 transition-colors hover:border-gold/40">
          <Upload className="mb-3 text-navy/40" size={32} />
          <span className="mb-1 text-sm font-medium text-navy">클릭하여 이미지 선택 (여러 장 가능)</span>
          <span className="text-xs text-navy/50">JPG, PNG, WEBP · 최대 4MB</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {localPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {localPreviews.map((preview) => (
              <div key={preview.id} className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={preview.url}
                  alt={preview.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={isUploading}
          onClick={handleUpload}
          className={`${adminPrimaryButtonClass} mt-4`}
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          저장
        </button>
      </section>

      <section className={adminCardClass}>
        <h2 className="mb-4 text-sm font-semibold text-navy">
          현재 갤러리 ({items.length}장)
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-navy/50">등록된 이미지가 없습니다.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(item.id)}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  item.is_featured ? "border-gold" : "border-navy/10"
                }`}
              >
                <div className="relative aspect-[4/3] bg-light-gray">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    unoptimized={isExternalUrl(item.image_url)}
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="absolute left-2 top-2 rounded bg-black/50 p-1 text-white">
                    <GripVertical size={16} />
                  </div>
                  {item.is_featured && (
                    <div className="absolute right-2 top-2 rounded bg-gold px-2 py-1 text-xs font-semibold text-white">
                      대표
                    </div>
                  )}
                </div>
                <div className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleSetFeatured(item.id)}
                    className={adminSecondaryButtonClass}
                  >
                    <Star size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className={adminDangerButtonClass}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
