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
): string {
  return buildProjectStoragePath(siteName, folder, fileName);
}

export function getHeroBackgroundObjectPath(
  siteName: string,
  extension: string,
): string {
  return assetPath(siteName, "hero", `hero-bg.${extension}`);
}

export function getOverviewImagePath(siteName: string, extension: string): string {
  return assetPath(siteName, "overview", `image.${extension}`);
}

export function getPremiumCardImagePath(
  siteName: string,
  cardId: string,
  extension: string,
): string {
  const safeId = cardId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "card";
  return assetPath(siteName, "premium", `${safeId}.${extension}`);
}

export function getLocationMainImagePath(siteName: string, extension: string): string {
  return assetPath(siteName, "location", `main.${extension}`);
}

export function getGalleryImagePath(
  siteName: string,
  itemId: string,
  extension: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "gallery", `${safeId}.${extension}`);
}

export function getFloorplanImagePath(
  siteName: string,
  itemId: string,
  extension: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "floorplans", `${safeId}.${extension}`);
}

export function getCommunityImagePath(
  siteName: string,
  itemId: string,
  extension: string,
): string {
  const safeId = itemId.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";
  return assetPath(siteName, "community", `${safeId}.${extension}`);
}

export {
  SITE_ASSETS_BUCKET,
  buildPublicStorageUrl,
  normalizeImageExtension,
} from "@/lib/storage/site-assets";
