import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings/defaults";
import { ALL_SITE_SETTING_KEYS, SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import { getSiteSettingsMap } from "@/lib/storage/site-settings";

export type SiteSettingsBundle = {
  siteName: string;
  projectName: string;
  browserTitle: string;
  mainDescription: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  footerText: string;
  companyName: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  robots: "index" | "noindex";
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  googleVerification: string;
  naverVerification: string;
  ga4Id: string;
  gtmId: string;
  metaPixel: string;
  favicon: string;
  appleIcon: string;
  sitemapAutoGenerate: boolean;
  robotsAutoGenerate: boolean;
  /** raw key → value (defaults merged) */
  values: Record<string, string>;
};

function pick(map: Record<string, string>, key: string): string {
  const value = map[key]?.trim();
  if (value) return value;
  return SITE_SETTINGS_DEFAULTS[key] ?? "";
}

function pickBool(map: Record<string, string>, key: string, defaultTrue = true): boolean {
  const raw = pick(map, key).toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return defaultTrue;
}

export function mergeSiteSettings(
  stored: Record<string, string>,
): SiteSettingsBundle {
  const map: Record<string, string> = { ...SITE_SETTINGS_DEFAULTS, ...stored };

  return {
    siteName: pick(map, SITE_SETTING_KEYS.SITE_NAME),
    projectName: pick(map, SITE_SETTING_KEYS.PROJECT_NAME),
    browserTitle: pick(map, SITE_SETTING_KEYS.BROWSER_TITLE),
    mainDescription: pick(map, SITE_SETTING_KEYS.MAIN_DESCRIPTION),
    contactPhone: pick(map, SITE_SETTING_KEYS.CONTACT_PHONE),
    contactEmail: pick(map, SITE_SETTING_KEYS.CONTACT_EMAIL),
    address: pick(map, SITE_SETTING_KEYS.ADDRESS),
    footerText: pick(map, SITE_SETTING_KEYS.FOOTER_TEXT),
    companyName: pick(map, SITE_SETTING_KEYS.COMPANY_NAME),
    seoTitle: pick(map, SITE_SETTING_KEYS.SEO_TITLE),
    seoDescription: pick(map, SITE_SETTING_KEYS.SEO_DESCRIPTION),
    seoKeywords: pick(map, SITE_SETTING_KEYS.SEO_KEYWORDS),
    canonicalUrl: pick(map, SITE_SETTING_KEYS.CANONICAL_URL),
    robots: pick(map, SITE_SETTING_KEYS.ROBOTS) === "noindex" ? "noindex" : "index",
    ogTitle: pick(map, SITE_SETTING_KEYS.OG_TITLE),
    ogDescription: pick(map, SITE_SETTING_KEYS.OG_DESCRIPTION),
    ogImage: pick(map, SITE_SETTING_KEYS.OG_IMAGE),
    ogUrl: pick(map, SITE_SETTING_KEYS.OG_URL),
    googleVerification: pick(map, SITE_SETTING_KEYS.GOOGLE_VERIFICATION),
    naverVerification: pick(map, SITE_SETTING_KEYS.NAVER_VERIFICATION),
    ga4Id: pick(map, SITE_SETTING_KEYS.GA4_ID),
    gtmId: pick(map, SITE_SETTING_KEYS.GTM_ID),
    metaPixel: pick(map, SITE_SETTING_KEYS.META_PIXEL),
    favicon: pick(map, SITE_SETTING_KEYS.FAVICON),
    appleIcon: pick(map, SITE_SETTING_KEYS.APPLE_ICON),
    sitemapAutoGenerate: pickBool(map, SITE_SETTING_KEYS.SITEMAP_AUTO_GENERATE),
    robotsAutoGenerate: pickBool(map, SITE_SETTING_KEYS.ROBOTS_AUTO_GENERATE),
    values: map,
  };
}

export async function loadSiteSettings(siteName?: string): Promise<SiteSettingsBundle> {
  const stored = await getSiteSettingsMap(ALL_SITE_SETTING_KEYS, siteName);
  return mergeSiteSettings(stored);
}

export function parseSeoKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
