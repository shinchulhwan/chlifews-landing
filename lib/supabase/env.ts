import { isSupabaseConfigured } from "@/lib/supabase";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey, serviceRoleKey };
}

export { isSupabaseConfigured };

export function isSupabaseAdminConfigured(): boolean {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) return false;

  const trimmed = serviceRoleKey.trim();
  if (!trimmed) return false;

  // env.example 플레이스홀더는 미설정으로 처리
  if (trimmed === "your_service_role_key") return false;

  return true;
}
