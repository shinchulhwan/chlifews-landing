import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getSupabaseEnv, isSupabaseAdminConfigured } from "@/lib/supabase/env";

/** Service Role 클라이언트 — 관리자 조회/수정/삭제용 (서버 전용) */
export function createServiceRoleClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 관리자 기능에 필요합니다.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function tryCreateServiceRoleClient() {
  if (!isSupabaseAdminConfigured()) return null;
  return createServiceRoleClient();
}
