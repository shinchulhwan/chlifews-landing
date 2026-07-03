import { buildProjectStoragePath } from "@/lib/storage/storage-key";

export type ProjectAssetFolder =
  | "hero"
  | "overview"
  | "premium"
  | "location"
  | "gallery"
  | "community"
  | "floorplans";

function assetPath(
  siteName: string,
  folder: ProjectAssetFolder,
  fileName: string,
  storageSlugOverride?: string,
): string {
  return buildProjectStoragePath(siteName, folder, fileName, storageSlugOverride);
}

export function getHeroBackgroundObjectPath(
  siteName: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  return assetPath(siteName, "hero", `hero-bg.${extension}`, storageSlugOverride);
}

export function getOverviewImagePath(
  siteName: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  return assetPath(siteName, "overview", `image.${extension}`, storageSlugOverride);
}

export function getPremiumCardImagePath(
  siteName: string,
  cardId: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  const safeId = cardId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "card";
  return assetPath(siteName, "premium", `${safeId}.${extension}`, storageSlugOverride);
}

export function getLocationMainImagePath(
  siteName: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  return assetPath(siteName, "location", `main.${extension}`, storageSlugOverride);
}

export function getGalleryImagePath(
  siteName: string,
  itemId: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "gallery", `${safeId}.${extension}`, storageSlugOverride);
}

export function getFloorplanImagePath(
  siteName: string,
  itemId: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "floorplans", `${safeId}.${extension}`, storageSlugOverride);
}

export function getCommunityImagePath(
  siteName: string,
  itemId: string,
  extension: string,
  storageSlugOverride?: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "community", `${safeId}.${extension}`, storageSlugOverride);
}

export {
  SITE_ASSETS_BUCKET,
  buildPublicStorageUrl,
  normalizeImageExtension,
} from "@/lib/storage/site-assets";
