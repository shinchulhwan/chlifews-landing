import { createHash } from "crypto";
import { getSiteNameFromEnv } from "@/lib/config/site";
import { KNOWN_SITE_SLUGS } from "@/lib/projects/known-slugs";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const STORAGE_KEY_PATTERN = /^[a-z0-9./-]+$/;

/**
 * 프로젝트 Storage slug
 * 1. storageSlugOverride (projects.storage_slug)
 * 2. SITE_STORAGE_SLUG env
 * 3. KNOWN_SITE_SLUGS 매핑
 * 4. SITE_NAME에서 라틴 문자만 slugify
 * 5. 한글 등만 있으면 site-{hash}
 */
export function getProjectStorageSlug(
  siteName?: string,
  storageSlugOverride?: string,
): string {
  const override = storageSlugOverride?.trim().toLowerCase();
  if (override && SLUG_PATTERN.test(override)) {
    return override;
  }

  const fromEnv = (process.env.SITE_STORAGE_SLUG ?? "").trim().toLowerCase();
  if (fromEnv && SLUG_PATTERN.test(fromEnv)) {
    return fromEnv;
  }

  const name = (siteName ?? getSiteNameFromEnv()).trim();

  if (name && KNOWN_SITE_SLUGS[name]) {
    return KNOWN_SITE_SLUGS[name];
  }

  const latinSlug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  if (latinSlug.length >= 2) {
    return latinSlug;
  }

  if (!name) {
    return "default";
  }

  const hash = createHash("sha256").update(name, "utf8").digest("hex").slice(0, 12);
  return `site-${hash}`;
}

/** Storage object key — a-z, 0-9, -, /, . 만 허용 */
export function sanitizeStorageKey(key: string): string {
  const segments = key
    .trim()
    .toLowerCase()
    .split("/")
    .map((segment) =>
      segment
        .replace(/[^a-z0-9.-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean);

  const sanitized = segments.join("/");

  if (!sanitized || !STORAGE_KEY_PATTERN.test(sanitized)) {
    throw new Error(`Invalid storage key after sanitize: ${key}`);
  }

  return sanitized;
}

/** 파일명 segment (확장자 포함) */
export function sanitizeStorageFileName(fileName: string): string {
  const parts = fileName.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  const base = parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const safeBase = base || "file";
  const safeExt = ext.replace(/[^a-z0-9]/g, "");

  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

export function buildProjectStoragePath(
  siteName: string | undefined,
  folder: string,
  fileName: string,
  storageSlugOverride?: string,
): string {
  const slug = getProjectStorageSlug(siteName, storageSlugOverride);
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const safeFile = sanitizeStorageFileName(fileName);
  return `projects/${slug}/${safeFolder}/${safeFile}`;
}
