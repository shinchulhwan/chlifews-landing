export type CustomerStatus = "pending" | "completed";

export type CustomerStatusFilter = "all" | "pending" | "completed";

export type CustomerSearchParams = {
  query?: string;
  phone?: string;
  status?: CustomerStatusFilter;
  site_name?: string;
};

export type CustomerStats = {
  total: number;
  today: number;
  pending: number;
  completed: number;
};

export type SiteTabItem = {
  site_name: string;
  count: number;
};

export type SiteTabCounts = {
  total: number;
  sites: SiteTabItem[];
};

export type BulkDeleteResult = {
  deleted: number;
  failed: number;
};

export type InterestCustomer = {
  id: number | string;
  name: string;
  phone: string;
  type: string | null;
  visit_date: string | null;
  memo: string | null;
  site_name: string;
  status: CustomerStatus;
  created_at: string | null;
};
