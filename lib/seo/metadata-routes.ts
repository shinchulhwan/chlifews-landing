import type { MetadataRoute } from "next";
import type { SiteSettingsBundle } from "@/lib/site-settings/load";

/** DB 기본값·미설정 시 사용하는 프로덕션 URL */
export const DEFAULT_PUBLIC_SITE_URL =
  "https://chlifews-landing.vercel.app";

const PLACEHOLDER_SITE_URLS = new Set([
  "https://example.com",
  "http://example.com",
]);

export type SitemapPathConfig = {
  /** 경로 (`/` = 홈) */
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
  lastModified?: Date;
};

/** 향후 랜딩·서브페이지 추가 시 이 배열에 path만 추가 */
export const SITEMAP_PATHS: SitemapPathConfig[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
];

/**
 * site_settings.canonical_url → NEXT_PUBLIC_SITE_URL → DEFAULT_PUBLIC_SITE_URL
 * placeholder(example.com)는 무시합니다.
 */
export function resolvePublicSiteUrl(canonicalUrl?: string): string {
  const candidates = [
    canonicalUrl?.trim().replace(/\/$/, ""),
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, ""),
    DEFAULT_PUBLIC_SITE_URL,
  ];

  for (const candidate of candidates) {
    if (candidate && !PLACEHOLDER_SITE_URLS.has(candidate)) {
      return candidate;
    }
  }

  return DEFAULT_PUBLIC_SITE_URL;
}

export function buildSitemapEntries(
  siteUrl: string,
  paths: SitemapPathConfig[] = SITEMAP_PATHS,
): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");

  return paths.map(({ path, changeFrequency, priority, lastModified }) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = normalizedPath === "/" ? base : `${base}${normalizedPath}`;

    return {
      url,
      lastModified: lastModified ?? new Date(),
      changeFrequency,
      priority,
    };
  });
}

export function buildRobotsConfig(
  settings: Pick<
    SiteSettingsBundle,
    "canonicalUrl" | "robots" | "robotsAutoGenerate" | "sitemapAutoGenerate"
  >,
): MetadataRoute.Robots {
  const siteUrl = resolvePublicSiteUrl(settings.canonicalUrl);

  if (!settings.robotsAutoGenerate) {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
      sitemap: settings.sitemapAutoGenerate
        ? `${siteUrl}/sitemap.xml`
        : undefined,
    };
  }

  const indexable = settings.robots !== "noindex";

  return {
    rules: [
      {
        userAgent: "*",
        allow: indexable ? "/" : undefined,
        disallow: indexable ? ["/admin/", "/api/"] : "/",
      },
    ],
    sitemap: settings.sitemapAutoGenerate
      ? `${siteUrl}/sitemap.xml`
      : undefined,
  };
}

export function buildSitemapConfig(
  settings: Pick<SiteSettingsBundle, "canonicalUrl" | "sitemapAutoGenerate">,
): MetadataRoute.Sitemap {
  if (!settings.sitemapAutoGenerate) {
    return [];
  }

  const siteUrl = resolvePublicSiteUrl(settings.canonicalUrl);
  return buildSitemapEntries(siteUrl);
}
