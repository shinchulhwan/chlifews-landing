"use server";

import { ADMIN_LOGIN_ERROR } from "@/lib/auth/admin-constants";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import {
  completeCustomer,
  deleteCustomer,
  deleteCustomers,
  getCustomerStats,
  getSiteTabCounts,
  searchCustomers,
} from "@/lib/storage/customers";
import type {
  BulkDeleteResult,
  CustomerSearchParams,
  CustomerStats,
  InterestCustomer,
  SiteTabCounts,
} from "@/lib/types/interest-customer";

export type AdminActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

export type AdminDashboardData = {
  customers: InterestCustomer[];
  stats: CustomerStats;
  siteTabs: SiteTabCounts;
};

function logSupabaseEnvStatus(): void {
  console.log("[admin] Supabase env", {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY: isSupabaseAdminConfigured(),
    isSupabaseConfigured: isSupabaseConfigured(),
  });
}

async function requireAdmin(): Promise<AdminActionResult | null> {
  if (!await isAdminAuthenticated()) {
    return { success: false, message: "관리자 로그인이 필요합니다." };
  }
  return null;
}

function supabaseConfigError(): AdminActionResult {
  const message =
    "Supabase 환경 변수가 없습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.";
  console.log(message);
  console.error("[admin]", message);
  return { success: false, message };
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<AdminActionResult> {
  if (!verifyAdminCredentials(username, password)) {
    return { success: false, message: ADMIN_LOGIN_ERROR };
  }

  await setAdminSession();
  return { success: true, message: "로그인되었습니다." };
}

export async function adminLogout(): Promise<AdminActionResult> {
  await clearAdminSession();
  return { success: true, message: "로그아웃되었습니다." };
}

export async function getAdminDashboardData(
  params: CustomerSearchParams = {},
): Promise<AdminActionResult<AdminDashboardData>> {
  const authError = await requireAdmin();
  if (authError) {
    return { success: false, message: authError.message };
  }

  if (!isSupabaseConfigured()) {
    return supabaseConfigError();
  }

  try {
    const [customers, stats, siteTabs] = await Promise.all([
      searchCustomers(params),
      getCustomerStats(params.site_name),
      getSiteTabCounts(),
    ]);

    return {
      success: true,
      message: "ok",
      data: { customers, stats, siteTabs },
    };
  } catch (error) {
    logSupabaseEnvStatus();
    console.log(error);
    const message = formatSupabaseError(error);
    console.error("[getAdminDashboardData]", message);
    return {
      success: false,
      message: `데이터를 불러오지 못했습니다. ${message}`,
    };
  }
}

export async function getCustomers(
  params: CustomerSearchParams = {},
): Promise<AdminActionResult<InterestCustomer[]>> {
  const result = await getAdminDashboardData(params);

  if (!result.success || !result.data) {
    return { success: false, message: result.message };
  }

  return {
    success: true,
    message: "ok",
    data: result.data.customers,
  };
}

export async function deleteCustomerAction(
  id: number | string,
): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) {
    return { success: false, message: authError.message };
  }

  if (id === undefined || id === null || (typeof id === "string" && id.trim() === "")) {
    const message = `삭제할 고객 ID가 없습니다. (id: ${String(id)})`;
    console.error("[deleteCustomerAction]", message);
    return { success: false, message };
  }

  try {
    await deleteCustomer(id);
    return { success: true, message: "고객 정보가 삭제되었습니다." };
  } catch (error) {
    console.log(error);
    const message = formatSupabaseError(error);
    console.error("[deleteCustomer]", message);
    return { success: false, message: `삭제에 실패했습니다. ${message}` };
  }
}

export async function deleteCustomersAction(
  ids: (number | string)[],
): Promise<AdminActionResult<BulkDeleteResult>> {
  const authError = await requireAdmin();
  if (authError) {
    return { success: false, message: authError.message };
  }

  if (!ids.length) {
    return { success: false, message: "삭제할 고객을 선택해 주세요." };
  }

  try {
    const result = await deleteCustomers(ids);

    if (result.failed === 0) {
      return {
        success: true,
        message: `삭제 완료\n${result.deleted}명 삭제되었습니다.`,
        data: result,
      };
    }

    if (result.deleted === 0) {
      return {
        success: false,
        message: `${result.failed}명 삭제 실패`,
        data: result,
      };
    }

    return {
      success: true,
      message: `삭제 완료\n${result.deleted}명 삭제되었습니다.\n${result.failed}명 삭제 실패`,
      data: result,
    };
  } catch (error) {
    console.log(error);
    const message = formatSupabaseError(error);
    console.error("[deleteCustomers]", message);
    return { success: false, message: `삭제에 실패했습니다. ${message}` };
  }
}

export async function completeCustomerAction(
  id: string,
): Promise<AdminActionResult> {
  const authError = await requireAdmin();
  if (authError) {
    return { success: false, message: authError.message };
  }

  if (!id) {
    return { success: false, message: "처리할 고객을 선택해 주세요." };
  }

  try {
    await completeCustomer(id);
    return { success: true, message: "완료 처리되었습니다." };
  } catch (error) {
    console.log(error);
    const message = formatSupabaseError(error);
    console.error("[completeCustomer]", message);
    return { success: false, message: `완료 처리에 실패했습니다. ${message}` };
  }
}
