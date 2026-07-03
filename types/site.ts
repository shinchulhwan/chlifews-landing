/**
 * 독립 배포 가능한 Site(사이트) 도메인 타입
 * DB `projects` 테이블과 1:1 매핑
 */
export type SiteStatus =
  | "draft"
  | "published"
  | "deploying"
  | "deployed"
  | "failed";

export type Site = {
  id: string;
  /** 표시용 프로젝트명 */
  name: string;
  /** CMS 테넌트 키 */
  siteName: string;
  /** URL slug — /{slug} */
  slug: string;
  /** Storage 경로 prefix — projects/{storageSlug}/... */
  storageSlug: string;
  domain: string | null;
  status: SiteStatus;
  isDefault: boolean;
  isPublished: boolean;
  clonedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSiteInput = {
  /** 프로젝트명 */
  displayName: string;
  /** 사이트명 (CMS site_name) — 비우면 프로젝트명 기반 자동 생성 */
  siteName?: string;
  slug: string;
  domain?: string;
  contactPhone?: string;
  heroImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  cloneFromSlug?: string;
};

export type SiteListFilters = {
  query?: string;
  publishedOnly?: boolean;
  status?: SiteStatus;
};
