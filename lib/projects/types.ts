export type ProjectRecord = {
  id: string;
  slug: string;
  site_name: string;
  storage_slug: string;
  display_name: string;
  domain: string | null;
  is_published: boolean;
  is_default: boolean;
  cloned_from_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateProjectInput = {
  displayName: string;
  slug: string;
  domain?: string;
  siteName?: string;
  cloneFromSlug?: string;
};

export type ProjectListFilters = {
  query?: string;
  publishedOnly?: boolean;
};
