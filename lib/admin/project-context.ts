import { cookies } from "next/headers";
import { getSiteNameFromEnv } from "@/lib/config/site";
import {
  getDefaultProject,
  getProjectBySlug,
} from "@/lib/projects/storage";
import type { ProjectRecord } from "@/lib/projects/types";

export const ADMIN_PROJECT_COOKIE = "chlabs_project_slug";

export async function getActiveProjectSlugFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const slug = cookieStore.get(ADMIN_PROJECT_COOKIE)?.value?.trim();
  return slug || null;
}

export async function resolveAdminProject(): Promise<ProjectRecord | null> {
  const slug = await getActiveProjectSlugFromCookie();
  if (slug) {
    const project = await getProjectBySlug(slug);
    if (project) return project;
  }

  return getDefaultProject();
}

export async function resolveAdminSiteName(projectSlug?: string): Promise<string> {
  if (projectSlug?.trim()) {
    const project = await getProjectBySlug(projectSlug);
    if (project) return project.site_name;
  }

  const active = await resolveAdminProject();
  if (active?.site_name) return active.site_name;

  return getSiteNameFromEnv();
}

export async function resolveAdminStorageSlug(
  projectSlug?: string,
): Promise<string | undefined> {
  if (projectSlug?.trim()) {
    const project = await getProjectBySlug(projectSlug);
    if (project) return project.storage_slug;
  }

  const active = await resolveAdminProject();
  return active?.storage_slug;
}
