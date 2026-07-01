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
} from "@/lib/site-settings/storage-paths";
import { ALL_SITE_SETTING_KEYS, SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import {
  getSectionFieldKeys,
  type SiteSettingsSectionId,
} from "@/lib/site-settings/fields";
import { mergeSiteSettings } from "@/lib/site-settings/load";
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

const MAX_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;

const FILE_KEY_TO_PATH: Record<string, (ext: string) => string> = {
  [SITE_SETTING_KEYS.OG_IMAGE]: getOgImagePath,
  [SITE_SETTING_KEYS.FAVICON]: getFaviconPath,
  [SITE_SETTING_KEYS.APPLE_ICON]: getAppleIconPath,
};

function revalidateSiteSettingsPaths(): void {
  try {
    revalidatePath("/");
    revalidatePath("/admin/site-settings");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.warn("[site-settings:revalidate]", error);
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
  console.log("[site-settings:upload] imageUrl:", publicUrl);
  return publicUrl;
}

const VERIFICATION_KEYS = new Set<string>([
  SITE_SETTING_KEYS.GOOGLE_VERIFICATION,
  SITE_SETTING_KEYS.NAVER_VERIFICATION,
  SITE_SETTING_KEYS.BING_VERIFICATION,
]);

export async function executeSaveSiteSettingsSection(
  sectionId: SiteSettingsSectionId,
  formData: FormData,
): Promise<ProjectContentActionResult<Record<string, string>>> {
  console.log("[save:site-settings] section:", sectionId);

  const allowedKeys = new Set(getSectionFieldKeys(sectionId));
  const entries: Record<string, string> = {};

  for (const key of allowedKeys) {
    if (key === SITE_SETTING_KEYS.OG_IMAGE ||
        key === SITE_SETTING_KEYS.FAVICON ||
        key === SITE_SETTING_KEYS.APPLE_ICON) {
      continue;
    }
    const raw = formData.get(key);
    if (typeof raw === "string") {
      entries[key] = raw;
    }
  }

  try {
    for (const key of [
      SITE_SETTING_KEYS.OG_IMAGE,
      SITE_SETTING_KEYS.FAVICON,
      SITE_SETTING_KEYS.APPLE_ICON,
    ]) {
      if (!allowedKeys.has(key)) continue;

      const file = formData.get(`file_${key}`);
      const existing = String(formData.get(`existing_${key}`) ?? "").trim();

      if (isUploadFile(file)) {
        if (file.size > MAX_FILE_SIZE) {
          return {
            success: false,
            message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)",
          };
        }
        const ext = normalizeImageExtension(getUploadFileName(file));
        if (!ext) {
          return {
            success: false,
            message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
          };
        }
        const pathFn = FILE_KEY_TO_PATH[key];
        if (!pathFn) continue;
        entries[key] = await uploadSiteAsset(file, pathFn(ext), getUploadFileName(file));
      } else if (existing) {
        entries[key] = existing;
      }
    }

    for (const key of Object.keys(entries)) {
      if (VERIFICATION_KEYS.has(key)) {
        entries[key] = normalizeVerificationCode(entries[key]);
      }
    }

    console.log("[save:site-settings] DB save:", entries);
    await setSiteSettingsBulk(entries);

    const allKeys = getSectionFieldKeys(sectionId);
    const stored = await getSiteSettingsMap(allKeys);
    const bundle = mergeSiteSettings(stored);
    const data: Record<string, string> = {};
    for (const key of allKeys) {
      data[key] = bundle.values[key] ?? "";
    }

    revalidateSiteSettingsPaths();
    console.log("[save:site-settings] Success", sectionId);
    return { success: true, message: "저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:site-settings] Failed:", message, error);
    return { success: false, message };
  }
}

export async function getSiteSettingsForAdmin(): Promise<Record<string, string>> {
  const stored = await getSiteSettingsMap(ALL_SITE_SETTING_KEYS);
  return mergeSiteSettings(stored).values;
}
