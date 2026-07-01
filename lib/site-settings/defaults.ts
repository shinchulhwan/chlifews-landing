/** DB·Storage에 값이 없을 때 Hero 배경 fallback */
export const DEFAULT_HERO_BACKGROUND_PATH = "/images/default-hero.jpg" as const;

const DEFAULT_SITE_BRAND = "동암역 더트루엘 아파트 분양정보";
const DEFAULT_SITE_TITLE =
  "동암역 더트루엘 아파트 분양정보 | 모델하우스위치·분양가격·상담";
const DEFAULT_SITE_DESCRIPTION =
  "동암역 더트루엘 분양정보를 확인하고 관심고객 등록을 통해 빠른 상담을 받아보세요. 분양가, 입지, 프리미엄, 타입 안내 및 방문예약 상담을 제공합니다.";
const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://example.com";
const DEFAULT_KEYWORDS =
  "동암역 더트루엘, chlifews, 분양, 분양정보, 모델하우스, 관심고객등록, 방문예약, 아파트분양, 오피스텔분양";
const DEFAULT_OG_TITLE = DEFAULT_SITE_TITLE;
const DEFAULT_OG_DESCRIPTION =
  "동암역 더트루엘 아파트 분양정보와 관심고객 등록, 방문예약 상담을 제공합니다.";

import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";

/** site_settings 기본값 (DB 미저장 시) */
export const SITE_SETTINGS_DEFAULTS: Record<string, string> = {
  [SITE_SETTING_KEYS.SITE_NAME]: DEFAULT_SITE_BRAND,
  [SITE_SETTING_KEYS.PROJECT_NAME]: DEFAULT_SITE_BRAND,
  [SITE_SETTING_KEYS.BROWSER_TITLE]: DEFAULT_SITE_TITLE,
  [SITE_SETTING_KEYS.MAIN_DESCRIPTION]: DEFAULT_SITE_DESCRIPTION,
  [SITE_SETTING_KEYS.CONTACT_PHONE]: "1844-0148",
  [SITE_SETTING_KEYS.CONTACT_EMAIL]: "",
  [SITE_SETTING_KEYS.ADDRESS]: "",
  [SITE_SETTING_KEYS.FOOTER_TEXT]:
    "*본 홈페이지에 사용된 이미지 및 내용은 소비자의 이해를 돕기 위한 것으로 실제와 다르거나 인허가 과정에 따라 변경될 수 있습니다.",
  [SITE_SETTING_KEYS.COMPANY_NAME]: "씨에이치랩스",

  [SITE_SETTING_KEYS.SEO_TITLE]: DEFAULT_SITE_TITLE,
  [SITE_SETTING_KEYS.SEO_DESCRIPTION]: DEFAULT_SITE_DESCRIPTION,
  [SITE_SETTING_KEYS.SEO_KEYWORDS]: DEFAULT_KEYWORDS,
  [SITE_SETTING_KEYS.CANONICAL_URL]: DEFAULT_SITE_URL,
  [SITE_SETTING_KEYS.ROBOTS]: "index",

  [SITE_SETTING_KEYS.OG_TITLE]: DEFAULT_OG_TITLE,
  [SITE_SETTING_KEYS.OG_DESCRIPTION]: DEFAULT_OG_DESCRIPTION,
  [SITE_SETTING_KEYS.OG_IMAGE]: "",
  [SITE_SETTING_KEYS.OG_URL]: DEFAULT_SITE_URL,

  [SITE_SETTING_KEYS.GOOGLE_VERIFICATION]: "",
  [SITE_SETTING_KEYS.NAVER_VERIFICATION]: "",
  [SITE_SETTING_KEYS.GA4_ID]: "",
  [SITE_SETTING_KEYS.GTM_ID]: "",
  [SITE_SETTING_KEYS.META_PIXEL]: "",

  [SITE_SETTING_KEYS.FAVICON]: "",
  [SITE_SETTING_KEYS.APPLE_ICON]: "",

  [SITE_SETTING_KEYS.SITEMAP_AUTO_GENERATE]: "true",
  [SITE_SETTING_KEYS.ROBOTS_AUTO_GENERATE]: "true",
};
