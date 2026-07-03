import type { ProjectRecord } from "@/lib/projects/types";
import type { Site, SiteStatus } from "@/types/site";

export function deriveSiteStatus(record: Pick<ProjectRecord, "status" | "is_published">): SiteStatus {
  if (record.status) return record.status;
  return record.is_published ? "published" : "draft";
}

export function projectRecordToSite(record: ProjectRecord): Site {
  return {
    id: record.id,
    name: record.display_name,
    siteName: record.site_name,
    slug: record.slug,
    storageSlug: record.storage_slug,
    domain: record.domain,
    status: deriveSiteStatus(record),
    isDefault: record.is_default,
    isPublished: record.is_published,
    clonedFromId: record.cloned_from_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function siteToProjectRecord(site: Site): ProjectRecord {
  return {
    id: site.id,
    slug: site.slug,
    site_name: site.siteName,
    storage_slug: site.storageSlug,
    display_name: site.name,
    domain: site.domain,
    status: site.status,
    is_published: site.isPublished,
    is_default: site.isDefault,
    cloned_from_id: site.clonedFromId,
    created_at: site.createdAt,
    updated_at: site.updatedAt,
  };
}
