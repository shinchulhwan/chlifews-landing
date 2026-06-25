/**
 * 사이트 SEO 공통 설정 (랜딩페이지)
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://example.com";

export const SITE_BRAND = "동암역 더트루엘 아파트 분양정보";

export const SITE_TITLE =
  "동암역 더트루엘 아파트 분양정보 | 모델하우스위치·분양가격·상담";

export const SITE_DESCRIPTION =
  "동암역 더트루엘 분양정보를 확인하고 관심고객 등록을 통해 빠른 상담을 받아보세요. 분양가, 입지, 프리미엄, 타입 안내 및 방문예약 상담을 제공합니다.";

export const SITE_KEYWORDS = [
  "동암역 더트루엘",
  "chlifews",
  "분양",
  "분양정보",
  "모델하우스",
  "관심고객등록",
  "방문예약",
  "아파트분양",
  "오피스텔분양",
] as const;

export const OPEN_GRAPH_TITLE =
  "동암역 더트루엘 아파트 분양정보 | 모델하우스위치·분양가격·상담";

export const OPEN_GRAPH_DESCRIPTION =
  "동암역 더트루엘 아파트 분양정보와 관심고객 등록, 방문예약 상담을 제공합니다.";

export const OG_IMAGE_PATH = "/images/hero.jpg";
export const OG_IMAGE_ALT =
  "동암역 더트루엘 아파트 분양 모델하우스 및 외관 전경";

export const HERO_IMAGE_ALT =
  "동암역 더트루엘 아파트 분양 모델하우스 외관 전경 이미지";

export const ORGANIZATION_NAME = SITE_BRAND;
export const ORGANIZATION_LOGO_PATH = "/images/hero.jpg";
