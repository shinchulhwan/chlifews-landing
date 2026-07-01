/** URL·라우트에 사용할 수 없는 slug */
export const RESERVED_PROJECT_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "static",
  "images",
  "imges",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeProjectSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function validateProjectSlug(slug: string): string | null {
  if (!slug) return "URL Slug를 입력해 주세요.";
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
  }
  if (RESERVED_PROJECT_SLUGS.has(slug)) {
    return `"${slug}"는 사용할 수 없는 Slug입니다.`;
  }
  return null;
}

export function buildSiteNameFromProject(displayName: string, slug: string): string {
  const name = displayName.trim();
  if (name) return name;
  return slug;
}
