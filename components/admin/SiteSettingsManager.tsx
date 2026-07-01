"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Loader2, Save, Upload } from "lucide-react";
import { postSiteSettingsSection } from "@/lib/admin/site-settings-client";
import {
  SITE_SETTINGS_SECTIONS,
  type SiteSettingsFieldDef,
  type SiteSettingsSectionDef,
} from "@/lib/site-settings/fields";
import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
  isExternalUrl,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type SiteSettingsManagerProps = {
  initialValues: Record<string, string>;
};

const FILE_KEYS: Set<string> = new Set([
  SITE_SETTING_KEYS.OG_IMAGE,
  SITE_SETTING_KEYS.FAVICON,
  SITE_SETTING_KEYS.APPLE_ICON,
]);

function FieldInput({
  field,
  value,
  onChange,
  filePreview,
  onFileChange,
}: {
  field: SiteSettingsFieldDef;
  value: string;
  onChange: (value: string) => void;
  filePreview: string | null;
  onFileChange: (file: File | null) => void;
}) {
  if (field.type === "file") {
    return (
      <div className="space-y-3">
        {value && (
          <div className="relative aspect-[1200/630] max-h-40 w-full overflow-hidden rounded-xl bg-navy/5">
            <Image
              src={filePreview ?? value}
              alt={field.label}
              fill
              unoptimized={isExternalUrl(filePreview ?? value)}
              className="object-contain p-2"
              sizes="400px"
            />
          </div>
        )}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-4 py-5 transition-colors hover:border-gold/40">
          <Upload className="mb-2 text-navy/40" size={20} />
          <span className="text-sm text-navy/70">클릭하여 이미지 선택</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/x-icon,.ico"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {value && !filePreview && (
          <p className="truncate text-xs text-navy/50">{value}</p>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        className={adminTextareaClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        dir="ltr"
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <select
        className={adminInputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={adminInputClass}
      type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      dir="ltr"
    />
  );
}

function SettingsSection({
  section,
  values,
  onValuesChange,
}: {
  section: SiteSettingsSectionDef;
  values: Record<string, string>;
  onValuesChange: (next: Record<string, string>) => void;
}) {
  const { toast, setToast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});

  const setField = useCallback(
    (key: string, value: string) => {
      onValuesChange({ ...values, [key]: value });
    },
    [onValuesChange, values],
  );

  function handleFileChange(key: string, file: File | null) {
    setPendingFiles((prev) => ({ ...prev, [key]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviews((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]);
        return { ...prev, [key]: url };
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      for (const field of section.fields) {
        const key = field.key;
        if (FILE_KEYS.has(key)) {
          const existing = values[key] ?? "";
          if (existing) formData.append(`existing_${key}`, existing);
          const file = pendingFiles[key];
          if (file) formData.append(`file_${key}`, file);
        } else {
          formData.append(key, values[key] ?? "");
        }
      }

      const result = await postSiteSettingsSection(section.id, formData);

      if (result.success) {
        setToast({ type: "success", message: `${section.title} 저장 완료` });
        if (result.data) {
          onValuesChange({ ...values, ...result.data });
        }
        setPendingFiles({});
        for (const url of Object.values(filePreviews)) {
          URL.revokeObjectURL(url);
        }
        setFilePreviews({});
      } else {
        setToast({ type: "error", message: result.message });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={adminCardClass}>
      <AdminToast toast={toast} />
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy">{section.title}</h2>
        <p className="mt-1 text-sm text-navy/60">{section.description}</p>
      </div>

      <div className="space-y-5">
        {section.fields.map((field) => (
          <div key={field.key}>
            <label className={adminLabelClass}>{field.label}</label>
            <FieldInput
              field={field}
              value={values[field.key] ?? ""}
              onChange={(v) => setField(field.key, v)}
              filePreview={filePreviews[field.key] ?? null}
              onFileChange={(f) => handleFileChange(field.key, f)}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-navy/50">{field.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end border-t border-navy/10 pt-5">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className={adminPrimaryButtonClass}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          저장
        </button>
      </div>
    </section>
  );
}

export default function SiteSettingsManager({
  initialValues,
}: SiteSettingsManagerProps) {
  const [values, setValues] = useState(initialValues);

  return (
    <AdminPageShell
      title="사이트 설정"
      description="랜딩페이지 사이트 정보, SEO, OG, 분석 스크립트를 관리합니다."
    >
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        {SITE_SETTINGS_SECTIONS.map((section) => (
          <SettingsSection
            key={section.id}
            section={section}
            values={values}
            onValuesChange={setValues}
          />
        ))}
      </div>
    </AdminPageShell>
  );
}
