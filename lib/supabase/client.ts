import {
  createSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

/** @deprecated lib/supabase.ts의 createSupabaseClient를 사용하세요 */
export function tryCreateAnonClient() {
  if (!isSupabaseConfigured()) return null;
  return createSupabaseClient();
}
