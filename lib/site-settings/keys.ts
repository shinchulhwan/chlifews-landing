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

  // SEO (레거시 — 사이트 설정 메뉴)
  SEO_TITLE: "seo_title",
  SEO_DESCRIPTION: "seo_description",
  SEO_KEYWORDS: "seo_keywords",
  CANONICAL_URL: "canonical_url",
  ROBOTS: "robots",

  // SEO / 메타태그 관리 (신규 key)
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  META_KEYWORDS: "meta_keywords",

  // Open Graph
  OG_TITLE: "og_title",
  OG_DESCRIPTION: "og_description",
  OG_IMAGE: "og_image",
  OG_URL: "og_url",
  OG_TYPE: "og_type",

  // Twitter Card
  TWITTER_TITLE: "twitter_title",
  TWITTER_DESCRIPTION: "twitter_description",
  TWITTER_IMAGE: "twitter_image",
  TWITTER_CARD: "twitter_card",

  // 검색엔진·분석
  GOOGLE_VERIFICATION: "google_verification",
  NAVER_VERIFICATION: "naver_verification",
  BING_VERIFICATION: "bing_verification",
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

/** SEO / 메타태그 관리 전용 key */
export const SEO_META_SETTING_KEYS = [
  SITE_SETTING_KEYS.SITE_NAME,
  SITE_SETTING_KEYS.META_TITLE,
  SITE_SETTING_KEYS.META_DESCRIPTION,
  SITE_SETTING_KEYS.META_KEYWORDS,
  SITE_SETTING_KEYS.CANONICAL_URL,
  SITE_SETTING_KEYS.ROBOTS,
  SITE_SETTING_KEYS.OG_TITLE,
  SITE_SETTING_KEYS.OG_DESCRIPTION,
  SITE_SETTING_KEYS.OG_IMAGE,
  SITE_SETTING_KEYS.OG_URL,
  SITE_SETTING_KEYS.OG_TYPE,
  SITE_SETTING_KEYS.TWITTER_TITLE,
  SITE_SETTING_KEYS.TWITTER_DESCRIPTION,
  SITE_SETTING_KEYS.TWITTER_IMAGE,
  SITE_SETTING_KEYS.TWITTER_CARD,
  SITE_SETTING_KEYS.GOOGLE_VERIFICATION,
  SITE_SETTING_KEYS.NAVER_VERIFICATION,
  SITE_SETTING_KEYS.BING_VERIFICATION,
  SITE_SETTING_KEYS.GA4_ID,
  SITE_SETTING_KEYS.GTM_ID,
  SITE_SETTING_KEYS.META_PIXEL,
  SITE_SETTING_KEYS.FAVICON,
  SITE_SETTING_KEYS.APPLE_ICON,
] as const;
