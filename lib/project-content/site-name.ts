import { getSiteNameFromEnv } from "@/lib/config/site";
import { getProjectStorageSlug } from "@/lib/storage/storage-key";

export function getCurrentSiteName(): string {
  return getSiteNameFromEnv();
}

export async function getCurrentSiteNameAsync(formData?: FormData): Promise<string> {
  const { resolveAdminSiteName } = await import("@/lib/admin/project-context");
  const projectSlug = formData
    ? String(formData.get("projectSlug") ?? "").trim()
    : "";
  const resolved = await resolveAdminSiteName(projectSlug || undefined);
  if (resolved) return resolved;
  return getSiteNameFromEnv();
}

export async function getCurrentStorageSlugAsync(formData?: FormData): Promise<string | undefined> {
  const { resolveAdminStorageSlug } = await import("@/lib/admin/project-context");
  const projectSlug = formData
    ? String(formData.get("projectSlug") ?? "").trim()
    : "";
  return resolveAdminStorageSlug(projectSlug || undefined);
}

/** @deprecated use getProjectStorageSlug */
export function sanitizeSiteNameForStorage(siteName: string): string {
  return getProjectStorageSlug(siteName);
}

export { getProjectStorageSlug };
