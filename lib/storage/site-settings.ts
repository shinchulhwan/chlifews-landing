import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import { getSiteNameFromEnv } from "@/lib/config/site";
import { getDefaultProject } from "@/lib/projects/storage";
import { DEFAULT_HERO_BACKGROUND_PATH } from "@/lib/site-settings/defaults";
import { SITE_SETTING_KEYS, type SiteSettingKey } from "@/lib/site-settings/keys";
import type { SiteSetting } from "@/lib/types/site-setting";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

async function resolveSettingsSiteName(siteName?: string): Promise<string> {
  if (siteName?.trim()) return siteName.trim();

  const envName = getSiteNameFromEnv();
  if (envName) return envName;

  const defaultProject = await getDefaultProject();
  return defaultProject?.site_name ?? "";
}

function isLegacySiteSettingsSchema(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42703" || error.message?.includes("site_name") === true;
}

async function getLegacySiteSettingsMap(
  supabase: SupabaseClient<Database>,
  keys: string[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  if (error) {
    logSupabaseError("site_settings:select-bulk-legacy", error);
    return result;
  }

  for (const row of data ?? []) {
    if (row.value?.trim()) {
      result[row.key] = row.value.trim();
    }
  }
  return result;
}

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

function mergeSettingsRows(
  rows: Array<{ key: string; value: string; site_name?: string }>,
  siteName: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  const legacy: Record<string, string> = {};

  for (const row of rows) {
    const value = row.value?.trim();
    if (!value) continue;
    if (row.site_name === siteName) {
      result[row.key] = value;
    } else if (!row.site_name) {
      legacy[row.key] = value;
    }
  }

  for (const [key, value] of Object.entries(legacy)) {
    if (!(key in result)) {
      result[key] = value;
    }
  }

  return result;
}

export async function getSiteSetting(
  key: SiteSettingKey | string,
  siteName?: string,
): Promise<string | null> {
  const resolvedSiteName = await resolveSettingsSiteName(siteName);
  const supabase = getReadClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value, site_name")
    .eq("key", key)
    .or(`site_name.eq.${resolvedSiteName},site_name.eq.`);

  if (error) {
    if (isLegacySiteSettingsSchema(error)) {
      const legacy = await getLegacySiteSettingsMap(supabase, [key]);
      return legacy[key] ?? null;
    }
    logSupabaseError("site_settings:select", error);
    return null;
  }

  const rows = data ?? [];
  const scoped = rows.find((r) => r.site_name === resolvedSiteName);
  if (scoped?.value?.trim()) return scoped.value.trim();
  const legacy = rows.find((r) => !r.site_name);
  return legacy?.value?.trim() || null;
}

export async function setSiteSetting(
  key: SiteSettingKey | string,
  value: string,
  siteName?: string,
): Promise<void> {
  await setSiteSettingsBulk({ [key]: value }, siteName);
}

export async function setSiteSettingsBulk(
  entries: Record<string, string>,
  siteName?: string,
): Promise<void> {
  const resolvedSiteName = await resolveSettingsSiteName(siteName);
  const supabase = getWriteClient();
  const now = new Date().toISOString();
  const rows = Object.entries(entries).map(([key, value]) => ({
    site_name: resolvedSiteName,
    key,
    value,
    updated_at: now,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("site_settings").upsert(rows, {
    onConflict: "site_name,key",
  });

  if (error && isLegacySiteSettingsSchema(error)) {
    const legacyRows = Object.entries(entries).map(([key, value]) => ({
      key,
      value,
      updated_at: now,
    }));
    const legacyResult = await supabase.from("site_settings").upsert(legacyRows, {
      onConflict: "key",
    });
    if (legacyResult.error) {
      logSupabaseError("site_settings:upsert-bulk-legacy", legacyResult.error);
      throw legacyResult.error;
    }
    return;
  }

  if (error) {
    logSupabaseError("site_settings:upsert-bulk", error);
    throw error;
  }
}

export async function getSiteSettingsMap(
  keys: string[],
  siteName?: string,
): Promise<Record<string, string>> {
  const resolvedSiteName = await resolveSettingsSiteName(siteName);
  const supabase = getReadClient();
  const result: Record<string, string> = {};

  if (!supabase || keys.length === 0) {
    return result;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, site_name")
    .in("key", keys)
    .or(`site_name.eq.${resolvedSiteName},site_name.eq.`);

  if (error) {
    if (isLegacySiteSettingsSchema(error)) {
      return getLegacySiteSettingsMap(supabase, keys);
    }
    logSupabaseError("site_settings:select-bulk", error);
    return result;
  }

  return mergeSettingsRows(data ?? [], resolvedSiteName);
}

export async function getSiteSettingRow(
  key: SiteSettingKey | string,
  siteName?: string,
): Promise<SiteSetting | null> {
  const resolvedSiteName = await resolveSettingsSiteName(siteName);
  const supabase = getReadClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("site_name, key, value, updated_at")
    .eq("key", key)
    .or(`site_name.eq.${resolvedSiteName},site_name.eq.`);

  if (error) {
    if (isLegacySiteSettingsSchema(error)) {
      const legacy = await getLegacySiteSettingsMap(supabase, [key]);
      const value = legacy[key];
      if (!value) return null;
      return { site_name: "", key, value, updated_at: new Date().toISOString() };
    }
    logSupabaseError("site_settings:select-row", error);
    return null;
  }

  const rows = data ?? [];
  const scoped = rows.find((r) => r.site_name === resolvedSiteName);
  if (scoped) return scoped;
  const legacy = rows.find((r) => !r.site_name);
  return legacy ?? null;
}

export async function getHeroBackgroundUrl(siteName?: string): Promise<string | null> {
  const value = await getSiteSetting(SITE_SETTING_KEYS.HERO_BACKGROUND, siteName);
  return value;
}

export async function getHeroBackgroundSetting(siteName?: string): Promise<{
  url: string;
  updated_at: string;
} | null> {
  const row = await getSiteSettingRow(SITE_SETTING_KEYS.HERO_BACKGROUND, siteName);
  const url = row?.value?.trim();
  if (!url || !row) return null;
  return { url, updated_at: row.updated_at };
}

/** 관리자 미리보기용 — DB 값 없을 때만 로컬 placeholder */
export async function getHeroBackgroundUrlForAdmin(siteName?: string): Promise<string> {
  const value = await getHeroBackgroundUrl(siteName);
  return value ?? DEFAULT_HERO_BACKGROUND_PATH;
}

export { DEFAULT_HERO_BACKGROUND_PATH };
