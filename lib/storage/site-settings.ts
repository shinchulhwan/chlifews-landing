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
  await setSiteSettingsBulk({ [key]: value });
}

export async function setSiteSettingsBulk(
  entries: Record<string, string>,
): Promise<void> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: now,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  if (error) {
    logSupabaseError("site_settings:upsert-bulk", error);
    throw error;
  }
}

export async function getSiteSettingsMap(
  keys: string[],
): Promise<Record<string, string>> {
  const supabase = getReadClient();
  const result: Record<string, string> = {};

  if (!supabase || keys.length === 0) {
    return result;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  if (error) {
    logSupabaseError("site_settings:select-bulk", error);
    return result;
  }

  for (const row of data ?? []) {
    if (row.value?.trim()) {
      result[row.key] = row.value.trim();
    }
  }

  return result;
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

export async function getHeroBackgroundUrl(): Promise<string | null> {
  const value = await getSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND);
  return value;
}

export async function getHeroBackgroundSetting(): Promise<{
  url: string;
  updated_at: string;
} | null> {
  const row = await getSiteSettingRow(SITE_SETTING_KEYS.HERO_BACKGROUND);
  const url = row?.value?.trim();
  if (!url || !row) return null;
  return { url, updated_at: row.updated_at };
}

/** 관리자 미리보기용 — DB 값 없을 때만 로컬 placeholder */
export async function getHeroBackgroundUrlForAdmin(): Promise<string> {
  const value = await getHeroBackgroundUrl();
  return value ?? DEFAULT_HERO_BACKGROUND_PATH;
}

export { DEFAULT_HERO_BACKGROUND_PATH };
