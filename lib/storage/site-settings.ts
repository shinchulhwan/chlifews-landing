import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import { DEFAULT_HERO_BACKGROUND_PATH } from "@/lib/site-settings/defaults";
import { SITE_SETTING_KEYS, type SiteSettingKey } from "@/lib/site-settings/keys";
import type { SiteSetting } from "@/lib/types/site-setting";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

function getReadClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return tryCreateServiceRoleClient() ?? createSupabaseClient();
}

function getWriteClient(): SupabaseClient<Database> {
  const client = tryCreateServiceRoleClient();

  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 필요합니다. site_settings 저장 및 Storage 업로드에 service role이 필요합니다.",
    );
  }

  return client;
}

export async function getSiteSetting(
  key: SiteSettingKey | string,
): Promise<string | null> {
  const supabase = getReadClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    logSupabaseError("site_settings:select", error);
    return null;
  }

  const value = data?.value?.trim();
  return value || null;
}

export async function setSiteSetting(
  key: SiteSettingKey | string,
  value: string,
): Promise<void> {
  const supabase = getWriteClient();

  const { error } = await supabase.from("site_settings").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    logSupabaseError("site_settings:upsert", error);
    throw error;
  }
}

export async function getSiteSettingRow(
  key: SiteSettingKey | string,
): Promise<SiteSetting | null> {
  const supabase = getReadClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    logSupabaseError("site_settings:select-row", error);
    return null;
  }

  return data ?? null;
}

export async function getHeroBackgroundUrl(): Promise<string> {
  const value = await getSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND);
  return value ?? DEFAULT_HERO_BACKGROUND_PATH;
}

export { DEFAULT_HERO_BACKGROUND_PATH };
