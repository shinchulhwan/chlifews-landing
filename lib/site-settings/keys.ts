/**
 * site_settings.key — 사이트·SEO 설정
 */
export const SITE_SETTING_KEYS = {
  HERO_BACKGROUND: "hero_background",

  // 기본 정보
  SITE_NAME: "site_name",
  PROJECT_NAME: "project_name",
  BROWSER_TITLE: "browser_title",
  MAIN_DESCRIPTION: "main_description",
  CONTACT_PHONE: "contact_phone",
  CONTACT_EMAIL: "contact_email",
  ADDRESS: "address",
  FOOTER_TEXT: "footer_text",
  COMPANY_NAME: "company_name",

  // SEO
  SEO_TITLE: "seo_title",
  SEO_DESCRIPTION: "seo_description",
  SEO_KEYWORDS: "seo_keywords",
  CANONICAL_URL: "canonical_url",
  ROBOTS: "robots",

  // Open Graph
  OG_TITLE: "og_title",
  OG_DESCRIPTION: "og_description",
  OG_IMAGE: "og_image",
  OG_URL: "og_url",

  // 검색엔진·분석
  GOOGLE_VERIFICATION: "google_verification",
  NAVER_VERIFICATION: "naver_verification",
  GA4_ID: "ga4_id",
  GTM_ID: "gtm_id",
  META_PIXEL: "meta_pixel",

  // 파비콘
  FAVICON: "favicon",
  APPLE_ICON: "apple_icon",

  // 사이트맵
  SITEMAP_AUTO_GENERATE: "sitemap_auto_generate",
  ROBOTS_AUTO_GENERATE: "robots_auto_generate",
} as const;

export type SiteSettingKey =
  (typeof SITE_SETTING_KEYS)[keyof typeof SITE_SETTING_KEYS];

export const ALL_SITE_SETTING_KEYS = Object.values(SITE_SETTING_KEYS);
