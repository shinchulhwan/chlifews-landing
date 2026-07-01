import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import { getSiteNameFromEnv } from "@/lib/config/site";
import { buildLegacyDefaultProject } from "@/lib/projects/resolve";
import {
  buildSiteNameFromProject,
  normalizeProjectSlug,
  validateProjectSlug,
} from "@/lib/projects/slugs";
import type {
  CreateProjectInput,
  ProjectListFilters,
  ProjectRecord,
} from "@/lib/projects/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

function getReadClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return tryCreateServiceRoleClient() ?? createSupabaseClient();
}

function getWriteClient(): SupabaseClient<Database> {
  const client = tryCreateServiceRoleClient();
  if (!client) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }
  return client;
}

function mapRow(row: ProjectRecord): ProjectRecord {
  return row;
}

export async function listProjects(
  filters: ProjectListFilters = {},
): Promise<ProjectRecord[]> {
  const supabase = getReadClient();
  if (!supabase) {
    const legacy = buildLegacyDefaultProject();
    return legacy ? [legacy] : [];
  }

  let query = supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01") {
      const legacy = buildLegacyDefaultProject();
      return legacy ? [legacy] : [];
    }
    logSupabaseError("projects:list", error);
    return [];
  }

  let rows = (data ?? []).map(mapRow);

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    rows = rows.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        p.site_name.toLowerCase().includes(q),
    );
  }

  return rows;
}

export async function getProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  const normalized = normalizeProjectSlug(slug);
  const supabase = getReadClient();
  if (!supabase) {
    const legacy = buildLegacyDefaultProject();
    return legacy?.slug === normalized ? legacy : null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      const legacy = buildLegacyDefaultProject();
      return legacy?.slug === normalized ? legacy : null;
    }
    logSupabaseError("projects:by-slug", error);
    return null;
  }

  return data ? mapRow(data) : null;
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<ProjectRecord | null> {
  const project = await getProjectBySlug(slug);
  if (!project?.is_published) return null;
  return project;
}

export async function getProjectBySiteName(
  siteName: string,
): Promise<ProjectRecord | null> {
  const supabase = getReadClient();
  if (!supabase) {
    const legacy = buildLegacyDefaultProject();
    return legacy?.site_name === siteName ? legacy : null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("site_name", siteName)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      const legacy = buildLegacyDefaultProject();
      return legacy?.site_name === siteName ? legacy : null;
    }
    logSupabaseError("projects:by-site-name", error);
    return null;
  }

  return data ? mapRow(data) : null;
}

export async function getDefaultProject(): Promise<ProjectRecord | null> {
  const supabase = getReadClient();
  if (!supabase) {
    return buildLegacyDefaultProject();
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return buildLegacyDefaultProject();
    }
    logSupabaseError("projects:default", error);
    return buildLegacyDefaultProject();
  }

  if (data) return mapRow(data);

  const envName = getSiteNameFromEnv();
  if (envName) {
    const byName = await getProjectBySiteName(envName);
    if (byName) return byName;
  }

  return buildLegacyDefaultProject();
}

export async function ensureDefaultProjectSeeded(): Promise<ProjectRecord | null> {
  const existing = await getDefaultProject();
  if (existing && existing.id !== "legacy-default") {
    return existing;
  }

  const siteName = getSiteNameFromEnv();
  if (!siteName) return existing;

  const storageSlug =
    process.env.SITE_STORAGE_SLUG?.trim().toLowerCase() || "dongam-truel";

  try {
    return await createProjectRecord({
      displayName: siteName,
      slug: storageSlug,
      siteName,
      setDefault: true,
      setPublished: true,
    });
  } catch {
    return buildLegacyDefaultProject();
  }
}

type CreateProjectRecordOptions = CreateProjectInput & {
  setDefault?: boolean;
  setPublished?: boolean;
  clonedFromId?: string | null;
};

export async function createProjectRecord(
  input: CreateProjectRecordOptions,
): Promise<ProjectRecord> {
  const slug = normalizeProjectSlug(input.slug);
  const slugError = validateProjectSlug(slug);
  if (slugError) throw new Error(slugError);

  const siteName = (input.siteName ?? buildSiteNameFromProject(input.displayName, slug)).trim();
  if (!siteName) throw new Error("프로젝트명을 입력해 주세요.");

  const supabase = getWriteClient();
  const now = new Date().toISOString();

  if (input.setDefault) {
    await supabase.from("projects").update({ is_default: false }).eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      slug,
      site_name: siteName,
      storage_slug: slug,
      display_name: input.displayName.trim() || siteName,
      domain: input.domain?.trim() || null,
      is_published: input.setPublished ?? false,
      is_default: input.setDefault ?? false,
      cloned_from_id: input.clonedFromId ?? null,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 사용 중인 Slug 또는 site_name입니다.");
    }
    logSupabaseError("projects:create", error);
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function updateProjectRecord(
  slug: string,
  patch: Partial<
    Pick<ProjectRecord, "display_name" | "domain" | "is_published" | "is_default">
  >,
): Promise<ProjectRecord> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  if (patch.is_default) {
    await supabase.from("projects").update({ is_default: false }).eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ ...patch, updated_at: now })
    .eq("slug", normalizeProjectSlug(slug))
    .select("*")
    .single();

  if (error) {
    logSupabaseError("projects:update", error);
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function deleteProjectRecord(slug: string): Promise<void> {
  const project = await getProjectBySlug(slug);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
  if (project.is_default) {
    throw new Error("기본 프로젝트는 삭제할 수 없습니다.");
  }

  const supabase = getWriteClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("slug", project.slug);

  if (error) {
    logSupabaseError("projects:delete", error);
    throw new Error(error.message);
  }
}
