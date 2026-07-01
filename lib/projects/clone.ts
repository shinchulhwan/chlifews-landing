import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import {
  getDefaultProject,
  getProjectBySlug,
} from "@/lib/projects/storage";
import type { ProjectRecord } from "@/lib/projects/types";
import type { Database } from "@/lib/types/database";

async function copySiteSettings(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>,
  sourceSiteName: string,
  targetSiteName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, site_name")
    .or(`site_name.eq.${sourceSiteName},site_name.eq.`);

  if (error) {
    logSupabaseError("clone:site_settings:select", error);
    throw error;
  }

  const byKey = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.site_name === sourceSiteName) {
      byKey.set(row.key, row.value);
    }
  }
  for (const row of data ?? []) {
    if (row.site_name === "" && !byKey.has(row.key)) {
      byKey.set(row.key, row.value);
    }
  }

  if (byKey.size === 0) return;

  const now = new Date().toISOString();
  const rows = Array.from(byKey.entries()).map(([key, value]) => ({
    site_name: targetSiteName,
    key,
    value,
    updated_at: now,
  }));

  const { error: upsertError } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "site_name,key" });

  if (upsertError) {
    logSupabaseError("clone:site_settings:upsert", upsertError);
    throw upsertError;
  }
}

async function copyOverview(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>,
  sourceSiteName: string,
  targetSiteName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("project_overview")
    .select("*")
    .eq("site_name", sourceSiteName)
    .maybeSingle();

  if (error || !data) return;

  const { id: _id, site_name: _sn, updated_at: _ua, ...rest } = data;
  const { error: insertError } = await supabase.from("project_overview").upsert(
    { ...rest, site_name: targetSiteName, updated_at: new Date().toISOString() },
    { onConflict: "site_name" },
  );

  if (insertError) {
    logSupabaseError("clone:overview", insertError);
    throw insertError;
  }
}

async function copyLocation(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>,
  sourceSiteName: string,
  targetSiteName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("project_location")
    .select("*")
    .eq("site_name", sourceSiteName)
    .maybeSingle();

  if (error || !data) return;

  const { id: _id, site_name: _sn, updated_at: _ua, ...rest } = data;
  const { error: insertError } = await supabase.from("project_location").upsert(
    { ...rest, site_name: targetSiteName, updated_at: new Date().toISOString() },
    { onConflict: "site_name" },
  );

  if (insertError) {
    logSupabaseError("clone:location", insertError);
    throw insertError;
  }
}

async function copyPremium(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>,
  sourceSiteName: string,
  targetSiteName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("project_premium")
    .select("*")
    .eq("site_name", sourceSiteName);

  if (error) throw error;
  if (!data?.length) return;

  await supabase.from("project_premium").delete().eq("site_name", targetSiteName);

  const rows = data.map((row) => {
    const { id: _id, site_name: _sn, created_at: _ca, updated_at: _ua, ...rest } = row;
    return {
      ...rest,
      site_name: targetSiteName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const { error: insertError } = await supabase.from("project_premium").insert(rows);
  if (insertError) {
    logSupabaseError("clone:premium", insertError);
    throw insertError;
  }
}

async function copySortableItems(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>,
  table: "project_gallery" | "project_community" | "project_floorplans",
  sourceSiteName: string,
  targetSiteName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("site_name", sourceSiteName)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (!data?.length) return;

  await supabase.from(table).delete().eq("site_name", targetSiteName);

  const rows = data.map((row) => {
    const record = row as Record<string, unknown>;
    const {
      id: _id,
      site_name: _sn,
      created_at: _ca,
      updated_at: _ua,
      ...rest
    } = record;
    return {
      ...rest,
      site_name: targetSiteName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const { error: insertError } = await supabase.from(table).insert(rows as never[]);
  if (insertError) {
    logSupabaseError(`clone:${table}`, insertError);
    throw insertError;
  }
}

/**
 * CMS·설정 데이터 복제 (customers / interest DB 제외)
 */
export async function cloneProjectContent(
  source: Pick<ProjectRecord, "site_name">,
  target: Pick<ProjectRecord, "site_name">,
): Promise<void> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  const sourceSiteName = source.site_name;
  const targetSiteName = target.site_name;

  await copySiteSettings(supabase, sourceSiteName, targetSiteName);
  await copyOverview(supabase, sourceSiteName, targetSiteName);
  await copyLocation(supabase, sourceSiteName, targetSiteName);
  await copyPremium(supabase, sourceSiteName, targetSiteName);
  await copySortableItems(supabase, "project_gallery", sourceSiteName, targetSiteName);
  await copySortableItems(supabase, "project_community", sourceSiteName, targetSiteName);
  await copySortableItems(supabase, "project_floorplans", sourceSiteName, targetSiteName);
}

export async function resolveCloneSource(
  cloneFromSlug?: string,
): Promise<ProjectRecord> {
  if (cloneFromSlug?.trim()) {
    const source = await getProjectBySlug(cloneFromSlug);
    if (!source) throw new Error("복제할 원본 프로젝트를 찾을 수 없습니다.");
    return source;
  }

  const defaultProject = await getDefaultProject();
  if (!defaultProject) {
    throw new Error("템플릿으로 사용할 기본 프로젝트가 없습니다.");
  }
  return defaultProject;
}
