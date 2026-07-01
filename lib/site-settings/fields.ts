import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";

export type SiteSettingsSectionId =
  | "basic"
  | "seo"
  | "og"
  | "search"
  | "favicon"
  | "sitemap";

export type SiteSettingsFieldType = "text" | "textarea" | "email" | "url" | "select" | "file";

export type SiteSettingsFieldDef = {
  key: string;
  label: string;
  type: SiteSettingsFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
};

export type SiteSettingsSectionDef = {
  id: SiteSettingsSectionId;
  title: string;
  description: string;
  fields: SiteSettingsFieldDef[];
};

export const SITE_SETTINGS_SECTIONS: SiteSettingsSectionDef[] = [
  {
    id: "basic",
    title: "기본 정보",
    description: "사이트 기본 정보와 푸터 문구를 관리합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.SITE_NAME, label: "사이트명", type: "text" },
      { key: SITE_SETTING_KEYS.PROJECT_NAME, label: "프로젝트명", type: "text" },
      { key: SITE_SETTING_KEYS.BROWSER_TITLE, label: "브라우저 제목 (Title)", type: "text" },
      {
        key: SITE_SETTING_KEYS.MAIN_DESCRIPTION,
        label: "메인 설명 (Description)",
        type: "textarea",
      },
      { key: SITE_SETTING_KEYS.CONTACT_PHONE, label: "대표 전화번호", type: "text" },
      { key: SITE_SETTING_KEYS.CONTACT_EMAIL, label: "대표 이메일", type: "email" },
      { key: SITE_SETTING_KEYS.ADDRESS, label: "주소", type: "text" },
      {
        key: SITE_SETTING_KEYS.FOOTER_TEXT,
        label: "Footer 문구",
        type: "textarea",
      },
      { key: SITE_SETTING_KEYS.COMPANY_NAME, label: "회사명 (CH Labs)", type: "text" },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    description: "검색엔진 최적화 메타 정보를 설정합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.SEO_TITLE, label: "SEO Title", type: "text" },
      {
        key: SITE_SETTING_KEYS.SEO_DESCRIPTION,
        label: "SEO Description",
        type: "textarea",
      },
      {
        key: SITE_SETTING_KEYS.SEO_KEYWORDS,
        label: "SEO Keywords",
        type: "text",
        placeholder: "키워드1, 키워드2, 키워드3",
        hint: "쉼표(,)로 구분",
      },
      { key: SITE_SETTING_KEYS.CANONICAL_URL, label: "Canonical URL", type: "url" },
      {
        key: SITE_SETTING_KEYS.ROBOTS,
        label: "Robots 설정",
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
    description: "SNS 공유 시 표시되는 OG 정보를 설정합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.OG_TITLE, label: "OG Title", type: "text" },
      {
        key: SITE_SETTING_KEYS.OG_DESCRIPTION,
        label: "OG Description",
        type: "textarea",
      },
      { key: SITE_SETTING_KEYS.OG_IMAGE, label: "OG Image", type: "file" },
      { key: SITE_SETTING_KEYS.OG_URL, label: "OG URL", type: "url" },
    ],
  },
  {
    id: "search",
    title: "검색엔진",
    description: "사이트 소유 확인 및 분석 스크립트 ID를 설정합니다.",
    fields: [
      {
        key: SITE_SETTING_KEYS.GOOGLE_VERIFICATION,
        label: "Google Search Console 인증코드",
        type: "text",
      },
      {
        key: SITE_SETTING_KEYS.NAVER_VERIFICATION,
        label: "Naver Search Advisor 인증코드",
        type: "text",
      },
      { key: SITE_SETTING_KEYS.GA4_ID, label: "Google Analytics (GA4)", type: "text" },
      { key: SITE_SETTING_KEYS.GTM_ID, label: "Google Tag Manager", type: "text" },
      { key: SITE_SETTING_KEYS.META_PIXEL, label: "Meta Pixel ID", type: "text" },
    ],
  },
  {
    id: "favicon",
    title: "파비콘",
    description: "브라우저 탭 아이콘을 업로드합니다.",
    fields: [
      { key: SITE_SETTING_KEYS.FAVICON, label: "Favicon", type: "file" },
      { key: SITE_SETTING_KEYS.APPLE_ICON, label: "Apple Touch Icon", type: "file" },
    ],
  },
  {
    id: "sitemap",
    title: "사이트맵",
    description: "sitemap.xml · robots.txt 자동 생성 여부를 설정합니다.",
    fields: [
      {
        key: SITE_SETTING_KEYS.SITEMAP_AUTO_GENERATE,
        label: "sitemap.xml 자동 생성",
        type: "select",
        options: [
          { value: "true", label: "사용" },
          { value: "false", label: "미사용" },
        ],
      },
      {
        key: SITE_SETTING_KEYS.ROBOTS_AUTO_GENERATE,
        label: "robots.txt 자동 생성",
        type: "select",
        options: [
          { value: "true", label: "사용" },
          { value: "false", label: "미사용" },
        ],
      },
    ],
  },
];

export function getSectionFieldKeys(sectionId: SiteSettingsSectionId): string[] {
  const section = SITE_SETTINGS_SECTIONS.find((s) => s.id === sectionId);
  return section?.fields.map((f) => f.key) ?? [];
}
