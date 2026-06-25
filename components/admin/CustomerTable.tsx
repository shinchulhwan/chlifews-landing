"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";
import CustomerSearch from "@/components/admin/CustomerSearch";
import CustomerStatsCards from "@/components/admin/CustomerStats";
import SiteTabs from "@/components/admin/SiteTabs";
import { ALL_SITES_TAB } from "@/lib/admin/site-tabs";
import { formatCreatedAt } from "@/lib/format/created-at";
import {
  adminLogout,
  completeCustomerAction,
  deleteCustomerAction,
  deleteCustomersAction,
  getAdminDashboardData,
} from "@/lib/actions/admin";
import type {
  CustomerStats,
  CustomerStatusFilter,
  InterestCustomer,
  SiteTabCounts,
} from "@/lib/types/interest-customer";

const POLL_INTERVAL_MS = 5000;
const TABLE_COL_COUNT = 10;

type CustomerTableProps = {
  initialCustomers: InterestCustomer[];
  initialStats: CustomerStats;
  initialSiteTabs: SiteTabCounts;
};

type SearchParams = {
  query: string;
  phone: string;
  status: CustomerStatusFilter;
  site_name: string;
};

const DEFAULT_SEARCH: SearchParams = {
  query: "",
  phone: "",
  status: "all",
  site_name: ALL_SITES_TAB,
};

function customerIdKey(id: number | string): string {
  return String(id);
}

function formatVisitDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

function isErrorMessage(message: string): boolean {
  return (
    message.includes("실패") ||
    message.includes("못했") ||
    message.includes("없습니다")
  );
}

export default function CustomerTable({
  initialCustomers,
  initialStats,
  initialSiteTabs,
}: CustomerTableProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [stats, setStats] = useState(initialStats);
  const [siteTabs, setSiteTabs] = useState(initialSiteTabs);
  const [activeSite, setActiveSite] = useState(ALL_SITES_TAB);
  const [isSearching, setIsSearching] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const searchParamsRef = useRef<SearchParams>(DEFAULT_SEARCH);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedIds.size;
  const visibleIds = customers.map((c) => customerIdKey(c.id));
  const allVisibleSelected =
    customers.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  const fetchDashboard = useCallback(
    async (params: SearchParams, options?: { silent?: boolean }) => {
      searchParamsRef.current = params;
      setActiveSite(params.site_name);

      if (!options?.silent) {
        setIsSearching(true);
        setMessage("");
      }

      const result = await getAdminDashboardData({
        query: params.query,
        phone: params.phone,
        status: params.status,
        site_name: params.site_name,
      });

      if (result.success && result.data) {
        setCustomers(result.data.customers);
        setStats(result.data.stats);
        setSiteTabs(result.data.siteTabs);
      } else {
        setMessage(result.message);
        console.error("[CustomerTable]", result.message);
      }

      if (!options?.silent) {
        setIsSearching(false);
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (params: {
      query: string;
      phone: string;
      status: CustomerStatusFilter;
    }) => {
      setSelectedIds(new Set());
      fetchDashboard({
        ...params,
        site_name: searchParamsRef.current.site_name,
      });
    },
    [fetchDashboard],
  );

  useEffect(() => {
    setCustomers(initialCustomers);
    setStats(initialStats);
    setSiteTabs(initialSiteTabs);
  }, [initialCustomers, initialStats, initialSiteTabs]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(searchParamsRef.current, { silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(visibleIds);
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [customers]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  function handleSiteChange(siteKey: string) {
    setActiveSite(siteKey);
    setSelectedIds(new Set());
    const params = { ...searchParamsRef.current, site_name: siteKey };
    fetchDashboard(params);
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleSelect(id: number | string) {
    const key = customerIdKey(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleDelete(customer: InterestCustomer) {
    console.log("[CustomerTable] delete customer.id:", customer.id);

    if (
      customer.id === undefined ||
      customer.id === null ||
      (typeof customer.id === "string" && customer.id.trim() === "")
    ) {
      const errMessage = `삭제할 고객 ID가 없습니다. (id: ${String(customer.id)})`;
      console.error("[CustomerTable]", errMessage);
      setMessage(errMessage);
      return;
    }

    if (!confirm("정말 삭제하시겠습니까?")) return;

    setActionId(String(customer.id));
    const result = await deleteCustomerAction(customer.id);

    if (result.success) {
      await fetchDashboard(searchParamsRef.current);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }

    setActionId(null);
  }

  async function handleBulkDelete() {
    if (selectedCount === 0) return;

    const ids = [...selectedIds].map((key) => {
      const customer = customers.find((c) => customerIdKey(c.id) === key);
      return customer?.id ?? key;
    });

    if (
      !confirm(`선택한 고객 ${selectedCount}명을 삭제하시겠습니까?`)
    ) {
      return;
    }

    setIsBulkDeleting(true);
    const result = await deleteCustomersAction(ids);

    if (result.success) {
      setSelectedIds(new Set());
      await fetchDashboard(searchParamsRef.current);
    }

    setMessage(result.message);
    setIsBulkDeleting(false);
  }

  async function handleComplete(id: string) {
    setActionId(id);
    const result = await completeCustomerAction(id);

    if (result.success) {
      await fetchDashboard(searchParamsRef.current, { silent: true });
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }

    setActionId(null);
  }

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">
            관심고객 관리
          </h1>
          <p className="mt-2 text-sm text-navy/60">
            목록 {customers.length}명 · 최신순 · 5초마다 자동 갱신
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>

      <SiteTabs
        siteTabs={siteTabs}
        activeSite={activeSite}
        onChange={handleSiteChange}
      />

      <CustomerStatsCards stats={stats} />

      <CustomerSearch onSearch={handleSearch} isSearching={isSearching} />

      {message && (
        <p
          className={`text-sm whitespace-pre-line ${isErrorMessage(message) ? "text-red-600" : "text-navy/70"}`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-navy/10 bg-light-gray/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-navy/70">
            선택됨 : {selectedCount}명
          </p>
          <button
            type="button"
            disabled={selectedCount === 0 || isBulkDeleting}
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-2 self-end rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:self-auto"
          >
            {isBulkDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            선택 삭제
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-navy/10 bg-light-gray text-xs font-semibold uppercase tracking-wide text-navy/60">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    disabled={customers.length === 0 || isBulkDeleting}
                    aria-label="현재 목록 전체 선택"
                    className="size-4 rounded border-navy/20 text-navy focus:ring-gold/30"
                  />
                </th>
                <th className="px-4 py-3">현장명</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">방문일</th>
                <th className="px-4 py-3">메모</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {isSearching ? (
                <tr>
                  <td
                    colSpan={TABLE_COL_COUNT}
                    className="px-4 py-12 text-center text-navy/50"
                  >
                    <Loader2 className="mx-auto animate-spin" size={24} />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_COL_COUNT}
                    className="px-4 py-12 text-center text-navy/50"
                  >
                    등록된 고객이 없습니다.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const idKey = customerIdKey(customer.id);
                  const isLoading = actionId === idKey;
                  const isSelected = selectedIds.has(idKey);

                  return (
                    <tr
                      key={idKey}
                      className={`hover:bg-light-gray/60 ${isSelected ? "bg-gold/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(customer.id)}
                          disabled={isBulkDeleting}
                          aria-label={`${customer.name} 선택`}
                          className="size-4 rounded border-navy/20 text-navy focus:ring-gold/30"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">
                        {customer.site_name?.trim() ? customer.site_name : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-navy/70">
                        {formatCreatedAt(customer.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-navy/80">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-navy/70">
                        {customer.type ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-navy/70">
                        {formatVisitDate(customer.visit_date)}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-navy/70">
                        {customer.memo ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.status === "completed"
                              ? "bg-gold/15 text-gold"
                              : "bg-navy/10 text-navy/70"
                          }`}
                        >
                          {customer.status === "completed" ? "완료" : "대기"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {customer.status === "pending" && (
                            <button
                              type="button"
                              disabled={isLoading || isBulkDeleting}
                              onClick={() => handleComplete(String(customer.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/25 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              완료
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isLoading || isBulkDeleting}
                            onClick={() => handleDelete(customer)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
