import { revalidatePath } from "next/cache";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import {
  getHeroBackgroundUrl,
  setSiteSetting,
} from "@/lib/storage/site-settings";
import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import {
  buildPublicStorageUrl,
  getHeroBackgroundObjectPath,
  normalizeImageExtension,
  SITE_ASSETS_BUCKET,
} from "@/lib/site-settings/storage";
import { getCurrentSiteName } from "@/lib/project-content/site-name";
import { sanitizeStorageKey } from "@/lib/storage/storage-key";
import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  getUploadFileName,
  isUploadFile,
  MAX_UPLOAD_FILE_SIZE,
} from "@/lib/admin/upload-utils";

const MAX_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;

export async function executeUploadHeroBackground(
  formData: FormData,
): Promise<
  ProjectContentActionResult<{
    backgroundUrl: string;
    publicUrl: string;
  }>
> {
  console.log("[save:hero-background] Saving...");

  const file = formData.get("file");

  if (!isUploadFile(file)) {
    return { success: false, message: "업로드할 이미지를 선택해 주세요." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: "이미지 크기는 10MB 이하여야 합니다." };
  }

  const extension = normalizeImageExtension(getUploadFileName(file));

  if (!extension) {
    return {
      success: false,
      message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
    };
  }

  const supabase = tryCreateServiceRoleClient();

  if (!supabase) {
    return {
      success: false,
      message:
        "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Storage 업로드에 service role이 필요합니다.",
    };
  }

  const { url: supabaseUrl } = getSupabaseEnv();

  if (!supabaseUrl) {
    return {
      success: false,
      message: "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.",
    };
  }

  const objectPath = sanitizeStorageKey(
    getHeroBackgroundObjectPath(getCurrentSiteName(), extension),
  );

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType =
      (file instanceof File && file.type) ||
      (extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg");

    const { error: uploadError } = await supabase.storage
      .from(SITE_ASSETS_BUCKET)
      .upload(objectPath, buffer, {
        upsert: true,
        contentType,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("[save:hero-background] storage error:", uploadError.message);
      return {
        success: false,
        message: `Storage 업로드 실패: ${uploadError.message}. supabase/STORAGE_SETUP.md를 참고해 site-assets 버킷을 생성하세요.`,
      };
    }

    const publicUrl = buildPublicStorageUrl(supabaseUrl, objectPath);
    await setSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND, publicUrl);

    revalidatePath("/");
    revalidatePath("/admin/hero-background");

    console.log("[save:hero-background] Success", publicUrl);

    return {
      success: true,
      message: "메인 배경 이미지가 저장되었습니다.",
      data: {
        backgroundUrl: publicUrl,
        publicUrl,
      },
    };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:hero-background] Failed:", message, error);
    return { success: false, message };
  }
}

export { getHeroBackgroundUrl };
