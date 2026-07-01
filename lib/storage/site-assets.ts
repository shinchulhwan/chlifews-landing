export const SITE_ASSETS_BUCKET = "site-assets" as const;

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function normalizeImageExtension(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return null;
  }

  return ext === "jpeg" ? "jpg" : ext;
}

export function buildPublicStorageUrl(
  supabaseUrl: string,
  objectPath: string,
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${SITE_ASSETS_BUCKET}/${objectPath}`;
}
