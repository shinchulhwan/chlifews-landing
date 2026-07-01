"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Loader2, Save, Upload } from "lucide-react";
import { postSeoMetaField } from "@/lib/admin/seo-meta-client";
import {
  SEO_META_FILE_KEYS,
  SEO_META_SECTIONS,
  type SeoMetaFieldDef,
  type SeoMetaSectionDef,
} from "@/lib/seo-meta/fields";
import { inspectSeoMeta } from "@/lib/seo-meta/inspect";
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

type SeoMetaManagerProps = {
  initialValues: Record<string, string>;
};

function resolvedMetaValues(values: Record<string, string>) {
  return {
    metaTitle:
      values[SITE_SETTING_KEYS.META_TITLE]?.trim() ||
      values[SITE_SETTING_KEYS.SEO_TITLE]?.trim() ||
      values[SITE_SETTING_KEYS.BROWSER_TITLE]?.trim() ||
      "",
    metaDescription:
      values[SITE_SETTING_KEYS.META_DESCRIPTION]?.trim() ||
      values[SITE_SETTING_KEYS.SEO_DESCRIPTION]?.trim() ||
      values[SITE_SETTING_KEYS.MAIN_DESCRIPTION]?.trim() ||
      "",
    metaKeywords:
      values[SITE_SETTING_KEYS.META_KEYWORDS]?.trim() ||
      values[SITE_SETTING_KEYS.SEO_KEYWORDS]?.trim() ||
      "",
    ogImage: values[SITE_SETTING_KEYS.OG_IMAGE]?.trim() ?? "",
    canonicalUrl: values[SITE_SETTING_KEYS.CANONICAL_URL]?.trim() ?? "",
    robots: values[SITE_SETTING_KEYS.ROBOTS]?.trim() ?? "",
  };
}

function FieldInput({
  field,
  value,
  onChange,
  filePreview,
  onFileChange,
}: {
  field: SeoMetaFieldDef;
  value: string;
  onChange: (value: string) => void;
  filePreview: string | null;
  onFileChange: (file: File | null) => void;
}) {
  if (field.type === "file") {
    return (
      <div className="space-y-3">
        {value && (
          <div className="relative aspect-[1200/630] max-h-32 w-full overflow-hidden rounded-xl bg-navy/5">
            <Image
              src={filePreview ?? value}
              alt={field.label}
              fill
              unoptimized={isExternalUrl(filePreview ?? value)}
              className="object-contain p-2"
              sizes="320px"
            />
          </div>
        )}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-4 py-4 transition-colors hover:border-gold/40">
          <Upload className="mb-2 text-navy/40" size={18} />
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
      type={field.type === "url" ? "url" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      dir="ltr"
    />
  );
}

function SeoFieldRow({
  field,
  value,
  onSaved,
  onValueChange,
}: {
  field: SeoMetaFieldDef;
  value: string;
  onSaved: (key: string, value: string) => void;
  onValueChange: (key: string, value: string) => void;
}) {
  const { toast, setToast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleFileChange(file: File | null) {
    setPendingFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();

      if (SEO_META_FILE_KEYS.has(field.key)) {
        if (value) formData.append("existing", value);
        if (pendingFile) formData.append("file", pendingFile);
      } else {
        formData.append("value", value);
      }

      const result = await postSeoMetaField(field.key, formData);

      if (result.success) {
        setToast({ type: "success", message: "저장 완료" });
        const saved = result.data?.value ?? value;
        onSaved(field.key, saved);
        setPendingFile(null);
        if (filePreview) {
          URL.revokeObjectURL(filePreview);
          setFilePreview(null);
        }
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
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <AdminToast toast={toast} />
      <label className={adminLabelClass}>{field.label}</label>
      <FieldInput
        field={field}
        value={value}
        onChange={(v) => onValueChange(field.key, v)}
        filePreview={filePreview}
        onFileChange={handleFileChange}
      />
      {field.hint && (
        <p className="mt-1 text-xs text-navy/50">{field.hint}</p>
      )}
      <div className="mt-4 flex items-center justify-end gap-3">
        {value && (
          <span className="truncate text-xs text-navy/40" title={value}>
            현재값: {value.length > 48 ? `${value.slice(0, 48)}…` : value}
          </span>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className={`${adminPrimaryButtonClass} shrink-0`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          저장
        </button>
      </div>
    </div>
  );
}

function SeoInspectionPanel({ values }: { values: Record<string, string> }) {
  const inspection = useMemo(
    () => inspectSeoMeta(resolvedMetaValues(values)),
    [values],
  );

  const scoreColor =
    inspection.score >= 80
      ? "text-emerald-600"
      : inspection.score >= 50
        ? "text-amber-600"
        : "text-red-600";

  return (
    <section className={adminCardClass}>
      <h2 className="text-lg font-semibold text-navy">SEO 검사</h2>
      <p className="mt-1 text-sm text-navy/60">
        현재 입력값 기준 SEO 상태를 확인합니다.
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-sm font-medium text-navy/70">SEO 점수</span>
        <span className={`text-3xl font-bold ${scoreColor}`}>
          {inspection.score}
        </span>
        <span className="text-sm text-navy/50">/ 100</span>
      </div>

      <ul className="mt-6 space-y-3">
        {inspection.checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center justify-between rounded-lg bg-light-gray/60 px-4 py-3 text-sm"
          >
            <span className="flex items-center gap-2 font-medium text-navy">
              {check.ok ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-navy/20" />
              )}
              {check.label}
            </span>
            <span className={check.ok ? "text-navy/60" : "text-amber-700"}>
              {check.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeoSection({
  section,
  values,
  onValuesChange,
}: {
  section: SeoMetaSectionDef;
  values: Record<string, string>;
  onValuesChange: (next: Record<string, string>) => void;
}) {
  const setField = useCallback(
    (key: string, value: string) => {
      onValuesChange({ ...values, [key]: value });
    },
    [onValuesChange, values],
  );

  return (
    <section className={adminCardClass}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy">{section.title}</h2>
        <p className="mt-1 text-sm text-navy/60">{section.description}</p>
      </div>

      <div className="space-y-4">
        {section.fields.map((field) => (
          <SeoFieldRow
            key={field.key}
            field={field}
            value={values[field.key] ?? ""}
            onValueChange={setField}
            onSaved={(key, saved) => setField(key, saved)}
          />
        ))}
      </div>
    </section>
  );
}

export default function SeoMetaManager({ initialValues }: SeoMetaManagerProps) {
  const [values, setValues] = useState(initialValues);

  return (
    <AdminPageShell
      title="SEO / 메타태그 관리"
      description="검색엔진·SNS 메타태그, 인증 코드, 분석 스크립트, 파비콘을 관리합니다."
    >
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        {SEO_META_SECTIONS.map((section) => (
          <SeoSection
            key={section.id}
            section={section}
            values={values}
            onValuesChange={setValues}
          />
        ))}
        <SeoInspectionPanel values={values} />
      </div>
    </AdminPageShell>
  );
}
