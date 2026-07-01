import { revalidatePath } from "next/cache";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import {
  getSiteSettingsMap,
  setSiteSettingsBulk,
} from "@/lib/storage/site-settings";
import {
  getAppleIconPath,
  getFaviconPath,
  getOgImagePath,
  getTwitterImagePath,
} from "@/lib/site-settings/storage-paths";
import {
  SEO_META_SETTING_KEYS,
  SITE_SETTING_KEYS,
} from "@/lib/site-settings/keys";
import { SEO_META_FILE_KEYS } from "@/lib/seo-meta/fields";
import { mergeSeoMetaSettings } from "@/lib/seo-meta/load";
import { normalizeVerificationCode } from "@/lib/seo/verification";
import {
  buildPublicStorageUrl,
  normalizeImageExtension,
  SITE_ASSETS_BUCKET,
} from "@/lib/site-settings/storage";
import { sanitizeStorageKey } from "@/lib/storage/storage-key";
import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  getUploadFileName,
  isUploadFile,
  MAX_UPLOAD_FILE_SIZE,
} from "@/lib/admin/upload-utils";

const FILE_KEY_TO_PATH: Record<string, (ext: string) => string> = {
  [SITE_SETTING_KEYS.OG_IMAGE]: getOgImagePath,
  [SITE_SETTING_KEYS.TWITTER_IMAGE]: getTwitterImagePath,
  [SITE_SETTING_KEYS.FAVICON]: getFaviconPath,
  [SITE_SETTING_KEYS.APPLE_ICON]: getAppleIconPath,
};

function revalidateSeoMetaPaths(): void {
  try {
    revalidatePath("/");
    revalidatePath("/admin/seo");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.warn("[seo-meta:revalidate]", error);
  }
}

async function uploadSiteAsset(
  file: File | Blob,
  objectPath: string,
  fileName?: string,
): Promise<string> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  }

  const { url: supabaseUrl } = getSupabaseEnv();
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
  }

  const name = fileName ?? (file instanceof File ? file.name : "upload.jpg");
  const extension = normalizeImageExtension(name);
  if (!extension) {
    throw new Error("jpg, jpeg, png, webp, ico 형식만 업로드할 수 있습니다.");
  }

  const safePath = sanitizeStorageKey(objectPath);
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    (file instanceof File && file.type) ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : extension === "ico"
          ? "image/x-icon"
          : "image/jpeg");

  const { error } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(safePath, buffer, {
      upsert: true,
      contentType,
      cacheControl: "60",
    });

  if (error) {
    throw new Error(`Storage 업로드 실패: ${error.message}`);
  }

  const publicUrl = buildPublicStorageUrl(supabaseUrl, safePath);
  console.log("[seo-meta:upload] imageUrl:", publicUrl);
  return publicUrl;
}

const VERIFICATION_KEYS = new Set<string>([
  SITE_SETTING_KEYS.GOOGLE_VERIFICATION,
  SITE_SETTING_KEYS.NAVER_VERIFICATION,
  SITE_SETTING_KEYS.BING_VERIFICATION,
]);

export async function executeSaveSeoMetaField(
  key: string,
  formData: FormData,
): Promise<ProjectContentActionResult<{ key: string; value: string }>> {
  const allowed = new Set<string>(SEO_META_SETTING_KEYS);
  if (!allowed.has(key)) {
    return { success: false, message: `허용되지 않은 key: ${key}` };
  }

  console.log("[save:seo-meta] key:", key);

  try {
    let value = "";

    if (SEO_META_FILE_KEYS.has(key)) {
      const file = formData.get("file");
      const existing = String(formData.get("existing") ?? "").trim();

      if (isUploadFile(file)) {
        if (file.size > MAX_UPLOAD_FILE_SIZE) {
          return {
            success: false,
            message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)",
          };
        }
        const ext = normalizeImageExtension(getUploadFileName(file));
        if (!ext) {
          return {
            success: false,
            message: "jpg, jpeg, png, webp, ico 형식만 업로드할 수 있습니다.",
          };
        }
        const pathFn = FILE_KEY_TO_PATH[key];
        if (!pathFn) {
          return { success: false, message: "파일 업로드 경로를 찾을 수 없습니다." };
        }
        value = await uploadSiteAsset(file, pathFn(ext), getUploadFileName(file));
      } else if (existing) {
        value = existing;
      } else {
        return { success: false, message: "업로드할 파일을 선택해 주세요." };
      }
    } else {
      const raw = formData.get("value");
      if (typeof raw !== "string") {
        return { success: false, message: "저장할 값이 없습니다." };
      }
      value = raw;
    }

    if (VERIFICATION_KEYS.has(key)) {
      value = normalizeVerificationCode(value);
    }

    const { resolveAdminSiteName } = await import("@/lib/admin/project-context");
    const siteName = await resolveAdminSiteName(
      String(formData.get("projectSlug") ?? "").trim() || undefined,
    );

    await setSiteSettingsBulk({ [key]: value }, siteName);

    const stored = await getSiteSettingsMap([key]);
    const bundle = mergeSeoMetaSettings(stored);
    const savedValue = bundle.values[key] ?? value;

    revalidateSeoMetaPaths();
    console.log("[save:seo-meta] Success", key);
    return {
      success: true,
      message: "저장되었습니다.",
      data: { key, value: savedValue },
    };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:seo-meta] Failed:", message, error);
    return { success: false, message };
  }
}

export async function getSeoMetaForAdmin(): Promise<Record<string, string>> {
  const { resolveAdminSiteName } = await import("@/lib/admin/project-context");
  const siteName = await resolveAdminSiteName();
  const stored = await getSiteSettingsMap([...SEO_META_SETTING_KEYS], siteName);
  return mergeSeoMetaSettings(stored).values;
}
