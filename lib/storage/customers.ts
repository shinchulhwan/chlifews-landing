import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import { normalizeCreatedAt } from "@/lib/format/created-at";
import type { Customer } from "@/lib/types/customer";
import type {
  BulkDeleteResult,
  CustomerSearchParams,
  CustomerStats,
  CustomerStatusFilter,
  InterestCustomer,
  SiteTabCounts,
} from "@/lib/types/interest-customer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type {
  CustomerSearchParams,
  CustomerStatusFilter,
} from "@/lib/types/interest-customer";

import {
  ALL_SITES_TAB,
  EMPTY_SITE_TAB,
  normalizeSiteTabKey,
} from "@/lib/admin/site-tabs";

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function getCustomersClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return tryCreateServiceRoleClient() ?? createSupabaseClient();
}

function requireClient(): SupabaseClient<Database> {
  const client = getCustomersClient();

  if (!client) {
    throw new Error(
      "Supabase 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
    );
  }

  return client;
}

function toInterestCustomer(row: Customer): InterestCustomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    type: null,
    visit_date: null,
    memo: row.memo,
    site_name: row.site_name ?? "",
    status: row.status ?? "pending",
    created_at: normalizeCreatedAt(row.created_at),
  };
}

function applySiteFilter<
  T extends { eq: (column: string, value: string) => T; or: (filters: string) => T },
>(query: T, siteKey?: string): T {
  if (!siteKey || siteKey === ALL_SITES_TAB) {
    return query;
  }

  if (siteKey === EMPTY_SITE_TAB) {
    return query.or("site_name.is.null,site_name.eq.");
  }

  return query.eq("site_name", siteKey);
}

function applyStatusFilter<
  T extends { eq: (column: string, value: string) => T },
>(query: T, status: CustomerStatusFilter): T {
  if (status === "pending" || status === "completed") {
    return query.eq("status", status);
  }

  return query;
}

function applySearchFilters<
  T extends {
    or: (filters: string) => T;
    ilike: (column: string, pattern: string) => T;
  },
>(query: T, params: CustomerSearchParams): T {
  const searchQuery = params.query?.trim();

  if (searchQuery) {
    const escaped = searchQuery.replace(/[%_]/g, "\\$&");
    const digits = normalizePhone(searchQuery);
    const phonePattern = digits ? `%${digits}%` : `%${escaped}%`;

    query = query.or(
      `name.ilike.%${escaped}%,memo.ilike.%${escaped}%,site_name.ilike.%${escaped}%,phone.ilike.${phonePattern}`,
    );
  }

  const phoneQuery = params.phone?.trim();

  if (phoneQuery) {
    const digits = normalizePhone(phoneQuery);
    query = query.ilike("phone", `%${digits || phoneQuery}%`);
  }

  return query;
}

function getStartOfTodayIso(): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export async function searchCustomers(
  params: CustomerSearchParams = {},
): Promise<InterestCustomer[]> {
  const supabase = requireClient();
  const status = params.status ?? "all";

  let query = supabase
    .from("customers")
    .select("id, name, phone, memo, site_name, status, created_at")
    .order("created_at", { ascending: false, nullsFirst: false });

  query = applySiteFilter(query, params.site_name);
  query = applyStatusFilter(query, status);
  query = applySearchFilters(query, params);

  const { data, error } = await query;

  if (error) {
    logSupabaseError("customers:select", error);
    throw error;
  }

  return (data ?? []).map(toInterestCustomer);
}

export async function getCustomerStats(
  siteKey?: string,
): Promise<CustomerStats> {
  const supabase = requireClient();
  const todayIso = getStartOfTodayIso();

  async function countWithFilters(
    filters?: { status?: CustomerStatusFilter; today?: boolean },
  ): Promise<number> {
    let query = supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    query = applySiteFilter(query, siteKey);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.today) {
      query = query.gte("created_at", todayIso);
    }

    const { count, error } = await query;

    if (error) {
      logSupabaseError("customers:stats", error);
      throw error;
    }

    return count ?? 0;
  }

  const [total, today, pending, completed] = await Promise.all([
    countWithFilters(),
    countWithFilters({ today: true }),
    countWithFilters({ status: "pending" }),
    countWithFilters({ status: "completed" }),
  ]);

  return { total, today, pending, completed };
}

export async function getSiteTabCounts(): Promise<SiteTabCounts> {
  const supabase = requireClient();

  const { data, error } = await supabase.from("customers").select("site_name");

  if (error) {
    logSupabaseError("customers:site_tabs", error);
    throw error;
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const key = normalizeSiteTabKey(row.site_name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sites = Array.from(counts.entries())
    .map(([site_name, count]) => ({ site_name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: data?.length ?? 0,
    sites,
  };
}

function isMissingCustomerId(id: unknown): boolean {
  if (id === undefined || id === null) return true;
  if (typeof id === "string" && id.trim() === "") return true;
  return false;
}

function requireServiceRoleClient(): SupabaseClient<Database> {
  const client = tryCreateServiceRoleClient();

  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 선택 삭제에는 Service Role 키가 필요합니다.",
    );
  }

  return client;
}

export async function deleteCustomer(id: number | string): Promise<boolean> {
  if (isMissingCustomerId(id)) {
    throw new Error(
      `삭제할 고객 ID가 없습니다. (id: ${String(id)})`,
    );
  }

  const supabase = requireClient();

  console.log("[deleteCustomer] delete id:", id, "typeof:", typeof id);

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    logSupabaseError("customers:delete", error);
    throw error;
  }

  const { data: stillExists, error: verifyError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (verifyError) {
    logSupabaseError("customers:delete:verify", verifyError);
    throw verifyError;
  }

  if (stillExists) {
    throw new Error(
      "삭제 권한이 없습니다. Supabase SQL Editor에서 supabase/migrations/004_customers_admin_policies.sql을 실행하거나 .env.local에 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.",
    );
  }

  return true;
}

export async function deleteCustomers(
  ids: (number | string)[],
): Promise<BulkDeleteResult> {
  const validIds = [...new Set(ids.filter((id) => !isMissingCustomerId(id)))];

  if (validIds.length === 0) {
    throw new Error("삭제할 고객이 선택되지 않았습니다.");
  }

  const supabase = requireServiceRoleClient();

  console.log("[deleteCustomers] ids:", validIds);

  const { error, count } = await supabase
    .from("customers")
    .delete({ count: "exact" })
    .in("id", validIds);

  if (error) {
    logSupabaseError("customers:bulk-delete", error);
    throw error;
  }

  const deleted = count ?? 0;
  const failed = validIds.length - deleted;

  return { deleted, failed };
}

export async function completeCustomer(id: string): Promise<boolean> {
  const supabase = requireClient();

  const direct = await supabase
    .from("customers")
    .update({ status: "completed" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (!direct.error && direct.data) {
    return true;
  }

  if (direct.error) {
    logSupabaseError("customers:complete", direct.error);
  }

  const { data: rpcOk, error: rpcError } = await supabase.rpc("complete_customer", {
    p_id: id,
  });

  if (rpcError) {
    logSupabaseError("customers:complete:rpc", rpcError);
    throw direct.error ?? rpcError;
  }

  if (!rpcOk) {
    throw new Error("완료 처리할 고객을 찾을 수 없습니다.");
  }

  return true;
}
