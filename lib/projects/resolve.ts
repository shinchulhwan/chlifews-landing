import { getSiteNameFromEnv } from "@/lib/config/site";
import { KNOWN_SITE_SLUGS } from "@/lib/projects/known-slugs";
import type { ProjectRecord } from "@/lib/projects/types";

/** 레거시 env 기반 단일 테넌트 → 기본 프로젝트 레코드 (DB 미마이그레이션 시) */
export function buildLegacyDefaultProject(): ProjectRecord | null {
  const siteName = getSiteNameFromEnv();
  if (!siteName) return null;

  const storageSlug =
    KNOWN_SITE_SLUGS[siteName] ??
    (process.env.SITE_STORAGE_SLUG?.trim().toLowerCase() || "dongam-truel");

  const now = new Date().toISOString();

  return {
    id: "legacy-default",
    slug: storageSlug,
    site_name: siteName,
    storage_slug: storageSlug,
    display_name: siteName,
    domain: null,
    is_published: true,
    is_default: true,
    cloned_from_id: null,
    created_at: now,
    updated_at: now,
  };
}

export function getProjectPublicUrl(project: Pick<ProjectRecord, "slug" | "is_default">): string {
  if (project.is_default) {
    return "/";
  }
  return `/${project.slug}`;
}

export function getProjectDeployUrl(
  project: Pick<ProjectRecord, "slug" | "is_default" | "domain">,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://chlifews-landing.vercel.app",
): string {
  if (project.domain?.trim()) {
    const domain = project.domain.trim().replace(/\/$/, "");
    return domain.startsWith("http") ? domain : `https://${domain}`;
  }
  const path = project.is_default ? "" : `/${project.slug}`;
  return `${baseUrl}${path}`;
}
