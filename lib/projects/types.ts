import type { SiteStatus, CreateSiteInput, SiteListFilters } from "@/types/site";

/** @deprecated Site 타입(@/types/site) 사용 권장 */
export type ProjectRecord = {
  id: string;
  slug: string;
  site_name: string;
  storage_slug: string;
  display_name: string;
  domain: string | null;
  status: SiteStatus;
  is_published: boolean;
  is_default: boolean;
  cloned_from_id: string | null;
  created_at: string;
  updated_at: string;
};

/** @deprecated CreateSiteInput(@/types/site) 사용 권장 */
export type CreateProjectInput = CreateSiteInput;

export type ProjectListFilters = SiteListFilters;

export type { SiteStatus, CreateSiteInput, SiteListFilters } from "@/types/site";
export type { Site } from "@/types/site";
