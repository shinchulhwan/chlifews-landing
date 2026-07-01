"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import {
  applySaveResult,
  postAdminJsonSave,
  postAdminSave,
} from "@/lib/admin/save-client";
import { broadcastProjectContent } from "@/lib/project-content/broadcast";
import type { ProjectFloorplan } from "@/lib/types/project-content";
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

type FloorplansManagerProps = {
  initialItems: ProjectFloorplan[];
};

type DraftState = {
  type_name: string;
  supply_area: string;
  exclusive_area: string;
  description: string;
  file: File | null;
  preview: string | null;
};

function emptyDraft(): DraftState {
  return {
    type_name: "",
    supply_area: "",
    exclusive_area: "",
    description: "",
    file: null,
    preview: null,
  };
}

export default function FloorplansManager({ initialItems }: FloorplansManagerProps) {
  const router = useRouter();
  const { toast, setToast } = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [newDraft, setNewDraft] = useState<DraftState>(emptyDraft());
  const [savingId, setSavingId] = useState<string | null>(null);

  function getDraft(item: ProjectFloorplan): DraftState {
    return (
      drafts[item.id] ?? {
        type_name: item.type_name,
        supply_area: item.supply_area,
        exclusive_area: item.exclusive_area,
        description: item.description,
        file: null,
        preview: null,
      }
    );
  }

  async function saveItem(item: ProjectFloorplan | null) {
    console.log("Save button clicked");
    const key = item?.id ?? "new";
    setSavingId(key);

    try {
      const draft = item ? getDraft(item) : newDraft;
      const formData = new FormData();
      if (item) formData.append("item_id", item.id);
      formData.append("type_name", draft.type_name);
      formData.append("supply_area", draft.supply_area);
      formData.append("exclusive_area", draft.exclusive_area);
      formData.append("description", draft.description);
      formData.append("sort_order", String(item?.sort_order ?? items.length));
      if (item?.image_url) formData.append("existing_image_url", item.image_url);
      if (draft.file) formData.append("image", draft.file);

      const result = await postAdminSave<ProjectFloorplan[]>("floorplan", formData);

      if (applySaveResult(result, setToast) && result.data) {
        setItems(result.data);
        if (!item) setNewDraft(emptyDraft());
        broadcastProjectContent("floorplans");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[FloorplansManager] saveItem failed:", error);
      setToast({ type: "error", message });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(itemId: string) {
    const result = await postAdminJsonSave<ProjectFloorplan[]>("floorplan-delete", {
      itemId,
    });
    if (applySaveResult(result, setToast) && result.data) {
      setItems(result.data);
      broadcastProjectContent("floorplans");
      router.refresh();
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ordered = [...items];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const result = await postAdminJsonSave<ProjectFloorplan[]>("floorplan-reorder", {
      orderedIds: ordered.map((i) => i.id),
    });
    if (result.success && result.data) {
      setItems(result.data);
      broadcastProjectContent("floorplans");
      router.refresh();
    }
  }

  function renderForm(
    draft: DraftState,
    onChange: (patch: Partial<DraftState>) => void,
    item: ProjectFloorplan | null,
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
              alt={draft.type_name}
              fill
              unoptimized={isExternalUrl(imageSrc)}
              className="object-contain"
              sizes="400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-navy/40">
              평면도 이미지 없음
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className={adminLabelClass}>타입명</label>
            <input
              className={adminInputClass}
              value={draft.type_name}
              onChange={(e) => onChange({ type_name: e.target.value })}
              placeholder="84A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={adminLabelClass}>공급면적</label>
              <input
                className={adminInputClass}
                value={draft.supply_area}
                onChange={(e) => onChange({ supply_area: e.target.value })}
                placeholder="84.99㎡"
              />
            </div>
            <div>
              <label className={adminLabelClass}>전용면적</label>
              <input
                className={adminInputClass}
                value={draft.exclusive_area}
                onChange={(e) => onChange({ exclusive_area: e.target.value })}
                placeholder="59.99㎡"
              />
            </div>
          </div>
          <div>
            <label className={adminLabelClass}>설명</label>
            <textarea
              className={`${adminInputClass} min-h-[80px] resize-y`}
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onChange({ file, preview: URL.createObjectURL(file) });
            }}
          />
          <button type="button" disabled={saving} onClick={onSave} className={adminPrimaryButtonClass}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPageShell
      title="평면도 관리"
      description="타입별 평면도 이미지와 면적 정보를 관리합니다."
    >
      <AdminToast toast={toast} />

      <div className="space-y-4">
        {items.map((item, index) => {
          const draft = getDraft(item);
          return (
            <section key={item.id} className={adminCardClass}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy">
                  {item.type_name || `타입 ${index + 1}`}
                </h3>
                <div className="flex gap-2">
                  <button type="button" className={adminSecondaryButtonClass} onClick={() => moveItem(index, -1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" className={adminSecondaryButtonClass} onClick={() => moveItem(index, 1)}>
                    <ArrowDown size={14} />
                  </button>
                  <button type="button" className={adminDangerButtonClass} onClick={() => handleDelete(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
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
          <h3 className="mb-4 text-sm font-semibold text-navy">새 평면도 추가</h3>
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
            {savingId === "new" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            평면도 추가
          </button>
        </section>
      </div>
    </AdminPageShell>
  );
}
