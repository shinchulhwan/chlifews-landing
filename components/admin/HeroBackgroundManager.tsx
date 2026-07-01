"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageIcon, Loader2, LogOut, Upload } from "lucide-react";
import { adminLogout } from "@/lib/actions/admin";
import { getHeroBackgroundSettingAction } from "@/lib/actions/site-settings-admin";
import { applySaveResult } from "@/lib/admin/save-client";
import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import {
  broadcastSiteSetting,
  subscribeSiteSetting,
} from "@/lib/site-settings/broadcast";

type HeroBackgroundManagerProps = {
  initialBackgroundUrl: string;
};

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function HeroBackgroundManager({
  initialBackgroundUrl,
}: HeroBackgroundManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundUrl, setBackgroundUrl] = useState(initialBackgroundUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const displayUrl = previewUrl ?? backgroundUrl;

  const refreshSetting = useCallback(async () => {
    const result = await getHeroBackgroundSettingAction();

    if (result.success && result.data) {
      setBackgroundUrl(result.data.backgroundUrl);
    }
  }, []);

  useEffect(() => {
    return subscribeSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND, (value) => {
      setBackgroundUrl(value);
      setPreviewUrl(null);
      setSelectedFile(null);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setToast(null);
  }

  async function handleSave() {
    console.log("Save button clicked");

    if (!selectedFile) {
      setToast({ type: "error", message: "업로드할 이미지를 선택해 주세요." });
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      console.log("Saving...");
      const response = await fetch("/api/admin/hero-background", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
        data?: { backgroundUrl: string; publicUrl: string };
      };

      console.log("[HeroBackgroundManager] API response:", result);

      if (applySaveResult(result, setToast) && result.data) {
        const newUrl = result.data.backgroundUrl;
        setBackgroundUrl(newUrl);

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        broadcastSiteSetting({
          key: SITE_SETTING_KEYS.HERO_BACKGROUND,
          value: newUrl,
        });

        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      console.error("[HeroBackgroundManager] handleSave failed:", error);
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-[0.2em] text-gold uppercase">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">
              메인 배경 관리
            </h1>
            <p className="mt-2 text-sm text-navy/60">
              Hero 섹션 배경 이미지를 업로드하면 모든 랜딩페이지에 자동 반영됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        {toast && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border-gold/30 bg-gold/10 text-navy"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={18} />
            )}
            {toast.message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
            <div className="border-b border-navy/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-navy">현재 배경 미리보기</h2>
            </div>
            <div className="relative aspect-[16/9] w-full bg-navy/5">
              <Image
                src={displayUrl}
                alt="Hero 배경 미리보기"
                fill
                unoptimized={isExternalUrl(displayUrl)}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-navy/20"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-end p-4">
                <p className="rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
                  {selectedFile ? "선택한 이미지 미리보기" : "현재 적용 중"}
                </p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="break-all text-xs text-navy/50">{displayUrl}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-navy">새 이미지 업로드</h2>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/15 bg-light-gray/60 px-6 py-10 transition-colors hover:border-gold/40 hover:bg-light-gray">
              <ImageIcon className="mb-3 text-navy/40" size={32} />
              <span className="mb-1 text-sm font-medium text-navy">
                클릭하여 이미지 선택
              </span>
              <span className="text-xs text-navy/50">
                JPG, PNG, WEBP · 최대 10MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <p className="mt-3 text-sm text-navy/70">
                선택됨: {selectedFile.name}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                저장
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={refreshSetting}
                className="rounded-xl border border-navy/10 px-5 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray"
              >
                새로고침
              </button>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-navy/50">
              Storage 버킷 <code className="text-navy/70">site-assets</code>에{" "}
              <code className="text-navy/70">projects/&#123;slug&#125;/hero/hero-bg.&#123;확장자&#125;</code>
              로 저장됩니다. slug는 <code className="text-navy/70">SITE_STORAGE_SLUG</code>
              환경 변수로 설정합니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
