import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";

export type SeoMetaSectionId =
  | "basic"
  | "og"
  | "twitter"
  | "verification"
  | "analytics"
  | "favicon";

export type SeoMetaFieldType =
  | "text"
  | "textarea"
  | "url"
  | "select"
  | "file";

export type SeoMetaFieldDef = {
  key: string;
  label: string;
  type: SeoMetaFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
};

export type SeoMetaSectionDef = {
  id: SeoMetaSectionId;
  title: string;
  description: string;
  fields: SeoMetaFieldDef[];
};

export const SEO_META_FILE_KEYS = new Set<string>([
  SITE_SETTING_KEYS.OG_IMAGE,
  SITE_SETTING_KEYS.TWITTER_IMAGE,
  SITE_SETTING_KEYS.FAVICON,
  SITE_SETTING_KEYS.APPLE_ICON,
]);

export const SEO_META_SECTIONS: SeoMetaSectionDef[] = [
  {
    id: "basic",
    title: "기본 SEO",
    description: "검색엔진에 노출되는 기본 메타 정보를 설정합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.SITE_NAME, label: "사이트명", type: "text" },
      { key: SITE_SETTING_KEYS.META_TITLE, label: "브라우저 제목 (Title)", type: "text" },
      {
        key: SITE_SETTING_KEYS.META_DESCRIPTION,
        label: "Meta Description",
        type: "textarea",
      },
      {
        key: SITE_SETTING_KEYS.META_KEYWORDS,
        label: "Meta Keywords",
        type: "text",
        placeholder: "키워드1, 키워드2, 키워드3",
        hint: "쉼표(,)로 구분",
      },
      { key: SITE_SETTING_KEYS.CANONICAL_URL, label: "Canonical URL", type: "url" },
      {
        key: SITE_SETTING_KEYS.ROBOTS,
        label: "Robots",
        type: "select",
        options: [
          { value: "index", label: "index (검색 허용)" },
          { value: "noindex", label: "noindex (검색 차단)" },
        ],
      },
    ],
  },
  {
    id: "og",
    title: "Open Graph",
    description: "SNS 공유 시 표시되는 OG 메타 정보를 설정합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.OG_TITLE, label: "OG Title", type: "text" },
      {
        key: SITE_SETTING_KEYS.OG_DESCRIPTION,
        label: "OG Description",
        type: "textarea",
      },
      { key: SITE_SETTING_KEYS.OG_IMAGE, label: "OG Image", type: "file" },
      { key: SITE_SETTING_KEYS.OG_URL, label: "OG URL", type: "url" },
      {
        key: SITE_SETTING_KEYS.OG_TYPE,
        label: "OG Type",
        type: "select",
        options: [{ value: "website", label: "website" }],
      },
    ],
  },
  {
    id: "twitter",
    title: "Twitter Card",
    description: "X(Twitter) 공유 시 표시되는 카드 정보를 설정합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.TWITTER_TITLE, label: "Twitter Title", type: "text" },
      {
        key: SITE_SETTING_KEYS.TWITTER_DESCRIPTION,
        label: "Twitter Description",
        type: "textarea",
      },
      { key: SITE_SETTING_KEYS.TWITTER_IMAGE, label: "Twitter Image", type: "file" },
      {
        key: SITE_SETTING_KEYS.TWITTER_CARD,
        label: "Twitter Card Type",
        type: "select",
        options: [
          { value: "summary", label: "summary" },
          { value: "summary_large_image", label: "summary_large_image" },
          { value: "app", label: "app" },
          { value: "player", label: "player" },
        ],
      },
    ],
  },
  {
    id: "verification",
    title: "검색엔진 인증",
    description:
      "인증 코드를 저장하면 google-site-verification, naver-site-verification 등 메타 태그가 자동 생성됩니다.",
    fields: [
      {
        key: SITE_SETTING_KEYS.GOOGLE_VERIFICATION,
        label: "Google Search Console Verification",
        type: "text",
      },
      {
        key: SITE_SETTING_KEYS.NAVER_VERIFICATION,
        label: "Naver Search Advisor Verification",
        type: "text",
      },
      {
        key: SITE_SETTING_KEYS.BING_VERIFICATION,
        label: "Bing Webmaster Verification",
        type: "text",
      },
    ],
  },
  {
    id: "analytics",
    title: "분석도구",
    description: "입력한 ID는 사이트 Head에 자동 삽입됩니다.",
    fields: [
      { key: SITE_SETTING_KEYS.GA4_ID, label: "Google Analytics (GA4 ID)", type: "text" },
      { key: SITE_SETTING_KEYS.GTM_ID, label: "Google Tag Manager ID", type: "text" },
      { key: SITE_SETTING_KEYS.META_PIXEL, label: "Meta Pixel ID", type: "text" },
    ],
  },
  {
    id: "favicon",
    title: "파비콘",
    description: "브라우저 탭 아이콘과 Apple Touch Icon을 업로드합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.FAVICON, label: "favicon.ico", type: "file" },
      { key: SITE_SETTING_KEYS.APPLE_ICON, label: "apple-touch-icon", type: "file" },
    ],
  },
];
