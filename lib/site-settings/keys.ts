/**
 * site_settings.key — 확장 가능한 설정 키
 *
 * 향후 logo, favicon, phone, kakao_link, site_name 등 동일 패턴으로 추가
 */
export const SITE_SETTING_KEYS = {
  HERO_BACKGROUND: "hero_background",
  // LOGO: "logo",
  // FAVICON: "favicon",
  // PHONE: "phone",
  // KAKAO_LINK: "kakao_link",
  // SITE_NAME: "site_name",
} as const;

export type SiteSettingKey =
  (typeof SITE_SETTING_KEYS)[keyof typeof SITE_SETTING_KEYS];
