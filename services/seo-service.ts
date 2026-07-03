import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import { loadSeoMetaSettings } from "@/lib/seo-meta/load";
import { setSiteSettingsBulk } from "@/lib/storage/site-settings";
import type { CreateSiteInput } from "@/types/site";
import type { PartialSeoConfig, SeoConfig } from "@/types/seo-config";

export function seoConfigFromCreateInput(
  input: Pick<
    CreateSiteInput,
    "seoTitle" | "seoDescription" | "seoKeywords" | "domain" | "displayName"
  >,
): PartialSeoConfig {
  const config: PartialSeoConfig = {};

  if (input.seoTitle?.trim()) {
    config.title = input.seoTitle.trim();
    config.ogTitle = input.seoTitle.trim();
  }
  if (input.seoDescription?.trim()) {
    config.description = input.seoDescription.trim();
    config.ogDescription = input.seoDescription.trim();
  }
  if (input.seoKeywords?.trim()) {
    config.keywords = input.seoKeywords.trim();
  }
  if (input.domain?.trim()) {
    const url = input.domain.trim().replace(/\/$/, "");
    config.canonicalUrl = url.startsWith("http") ? url : `https://${url}`;
    config.ogUrl = config.canonicalUrl;
  }
  if (input.displayName?.trim()) {
    config.ogTitle = config.ogTitle ?? input.displayName.trim();
  }

  return config;
}

export async function getSeoConfig(siteName: string): Promise<SeoConfig> {
  const meta = await loadSeoMetaSettings(siteName);
  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords: meta.metaKeywords,
    ogTitle: meta.ogTitle,
    ogDescription: meta.ogDescription,
    ogImage: meta.ogImage,
    ogUrl: meta.ogUrl,
    ogType: meta.ogType,
    canonicalUrl: meta.canonicalUrl,
    robots: meta.robots,
    sitemapAutoGenerate: meta.values[SITE_SETTING_KEYS.SITEMAP_AUTO_GENERATE] !== "false",
    robotsAutoGenerate: meta.values[SITE_SETTING_KEYS.ROBOTS_AUTO_GENERATE] !== "false",
    googleVerification: meta.googleVerification,
    naverVerification: meta.naverVerification,
    bingVerification: meta.bingVerification,
  };
}

export async function applySeoConfig(
  siteName: string,
  config: PartialSeoConfig,
): Promise<void> {
  const entries: Record<string, string> = {};

  if (config.title !== undefined) {
    entries[SITE_SETTING_KEYS.META_TITLE] = config.title;
    entries[SITE_SETTING_KEYS.SEO_TITLE] = config.title;
    entries[SITE_SETTING_KEYS.BROWSER_TITLE] = config.title;
  }
  if (config.description !== undefined) {
    entries[SITE_SETTING_KEYS.META_DESCRIPTION] = config.description;
    entries[SITE_SETTING_KEYS.SEO_DESCRIPTION] = config.description;
    entries[SITE_SETTING_KEYS.MAIN_DESCRIPTION] = config.description;
  }
  if (config.keywords !== undefined) {
    entries[SITE_SETTING_KEYS.META_KEYWORDS] = config.keywords;
    entries[SITE_SETTING_KEYS.SEO_KEYWORDS] = config.keywords;
  }
  if (config.ogTitle !== undefined) entries[SITE_SETTING_KEYS.OG_TITLE] = config.ogTitle;
  if (config.ogDescription !== undefined) {
    entries[SITE_SETTING_KEYS.OG_DESCRIPTION] = config.ogDescription;
  }
  if (config.ogImage !== undefined) entries[SITE_SETTING_KEYS.OG_IMAGE] = config.ogImage;
  if (config.ogUrl !== undefined) entries[SITE_SETTING_KEYS.OG_URL] = config.ogUrl;
  if (config.ogType !== undefined) entries[SITE_SETTING_KEYS.OG_TYPE] = config.ogType;
  if (config.canonicalUrl !== undefined) {
    entries[SITE_SETTING_KEYS.CANONICAL_URL] = config.canonicalUrl;
  }
  if (config.robots !== undefined) entries[SITE_SETTING_KEYS.ROBOTS] = config.robots;
  if (config.googleVerification !== undefined) {
    entries[SITE_SETTING_KEYS.GOOGLE_VERIFICATION] = config.googleVerification;
  }
  if (config.naverVerification !== undefined) {
    entries[SITE_SETTING_KEYS.NAVER_VERIFICATION] = config.naverVerification;
  }
  if (config.bingVerification !== undefined) {
    entries[SITE_SETTING_KEYS.BING_VERIFICATION] = config.bingVerification;
  }
  if (config.sitemapAutoGenerate !== undefined) {
    entries[SITE_SETTING_KEYS.SITEMAP_AUTO_GENERATE] = String(config.sitemapAutoGenerate);
  }
  if (config.robotsAutoGenerate !== undefined) {
    entries[SITE_SETTING_KEYS.ROBOTS_AUTO_GENERATE] = String(config.robotsAutoGenerate);
  }

  if (Object.keys(entries).length > 0) {
    await setSiteSettingsBulk(entries, siteName);
  }
}

export async function applyInitialSiteSettings(
  siteName: string,
  input: Pick<
    CreateSiteInput,
    "displayName" | "siteName" | "contactPhone" | "heroImageUrl" | "domain"
  >,
  seoOverride?: PartialSeoConfig,
): Promise<void> {
  const entries: Record<string, string> = {};

  if (input.siteName?.trim()) {
    entries[SITE_SETTING_KEYS.SITE_NAME] = input.siteName.trim();
    entries[SITE_SETTING_KEYS.PROJECT_NAME] = input.displayName.trim() || input.siteName.trim();
  }
  if (input.contactPhone?.trim()) {
    entries[SITE_SETTING_KEYS.CONTACT_PHONE] = input.contactPhone.trim();
  }
  if (input.heroImageUrl?.trim()) {
    entries[SITE_SETTING_KEYS.HERO_BACKGROUND] = input.heroImageUrl.trim();
    if (!seoOverride?.ogImage) {
      entries[SITE_SETTING_KEYS.OG_IMAGE] = input.heroImageUrl.trim();
    }
  }

  if (Object.keys(entries).length > 0) {
    await setSiteSettingsBulk(entries, siteName);
  }

  if (seoOverride && Object.keys(seoOverride).length > 0) {
    await applySeoConfig(siteName, seoOverride);
  }
}
