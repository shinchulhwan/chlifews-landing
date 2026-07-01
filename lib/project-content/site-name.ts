import { getSiteNameFromEnv } from "@/lib/config/site";
import { getProjectStorageSlug } from "@/lib/storage/storage-key";

export function getCurrentSiteName(): string {
  return getSiteNameFromEnv();
}

/** @deprecated use getProjectStorageSlug */
export function sanitizeSiteNameForStorage(siteName: string): string {
  return getProjectStorageSlug(siteName);
}

export { getProjectStorageSlug };
