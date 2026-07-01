import { getProjectStorageSlug, sanitizeStorageKey } from "@/lib/storage/storage-key";
import { sanitizeStorageFileName } from "@/lib/storage/storage-key";

export function getSiteSettingsAssetPath(fileName: string): string {
  const slug = getProjectStorageSlug();
  const safeFile = sanitizeStorageFileName(fileName);
  return sanitizeStorageKey(`projects/${slug}/site-settings/${safeFile}`);
}

export function getOgImagePath(extension: string): string {
  return getSiteSettingsAssetPath(`og-image.${extension}`);
}

export function getFaviconPath(extension: string): string {
  return getSiteSettingsAssetPath(`favicon.${extension}`);
}

export function getAppleIconPath(extension: string): string {
  return getSiteSettingsAssetPath(`apple-icon.${extension}`);
}
