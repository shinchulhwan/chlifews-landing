"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import {
  getHeroBackgroundUrl,
  getSiteSettingRow,
  setSiteSetting,
} from "@/lib/storage/site-settings";
import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import { getCurrentSiteName } from "@/lib/project-content/site-name";
import { sanitizeStorageKey } from "@/lib/storage/storage-key";
import { DEFAULT_HERO_BACKGROUND_PATH } from "@/lib/site-settings/defaults";
import {
  buildPublicStorageUrl,
  getHeroBackgroundObjectPath,
  normalizeImageExtension,
  SITE_ASSETS_BUCKET,
} from "@/lib/site-settings/storage";
import type { SiteSetting } from "@/lib/types/site-setting";

export type SiteSettingsActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function requireAdmin(): Promise<SiteSettingsActionResult<never> | null> {
  if (!await isAdminAuthenticated()) {
    return { success: false, message: "관리자 로그인이 필요합니다." };
  }
  return null;
}

export async function getHeroBackgroundSettingAction(): Promise<
  SiteSettingsActionResult<{
    backgroundUrl: string;
    setting: SiteSetting | null;
  }>
> {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  try {
    const [backgroundUrl, setting] = await Promise.all([
      getHeroBackgroundUrl(),
      getSiteSettingRow(SITE_SETTING_KEYS.HERO_BACKGROUND),
    ]);

    return {
      success: true,
      message: "ok",
      data: { backgroundUrl, setting },
    };
  } catch (error) {
    return {
      success: false,
      message: formatSupabaseError(error),
    };
  }
}

export async function uploadHeroBackgroundAction(
  formData: FormData,
): Promise<
  SiteSettingsActionResult<{
    backgroundUrl: string;
    publicUrl: string;
  }>
> {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "업로드할 이미지를 선택해 주세요." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: "이미지 크기는 10MB 이하여야 합니다.",
    };
  }

  const extension = normalizeImageExtension(file.name);

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
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg");

  try {
    const { error: uploadError } = await supabase.storage
      .from(SITE_ASSETS_BUCKET)
      .upload(objectPath, buffer, {
        upsert: true,
        contentType,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("[uploadHeroBackground] storage error:", uploadError);
      return {
        success: false,
        message: `Storage 업로드 실패: ${uploadError.message}. supabase/STORAGE_SETUP.md를 참고해 site-assets 버킷을 생성하세요.`,
      };
    }

    const publicUrl = buildPublicStorageUrl(supabaseUrl, objectPath);

    await setSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND, publicUrl);

    revalidatePath("/");
    revalidatePath("/admin/hero-background");

    return {
      success: true,
      message: "메인 배경 이미지가 저장되었습니다.",
      data: {
        backgroundUrl: publicUrl,
        publicUrl,
      },
    };
  } catch (error) {
    console.error("[uploadHeroBackground]", error);
    return {
      success: false,
      message: formatSupabaseError(error),
    };
  }
}

export async function getPublicHeroBackgroundUrl(): Promise<string> {
  try {
    return await getHeroBackgroundUrl();
  } catch {
    return DEFAULT_HERO_BACKGROUND_PATH;
  }
}
