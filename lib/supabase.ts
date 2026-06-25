import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseConnectionTestResult = {
  ok: boolean;
  message: string;
  url?: string;
  error?: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Supabase Client 생성 (서버·클라이언트 공용)
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 사용
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
    );
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let browserClient: SupabaseClient<Database> | null = null;

/** Client Component용 싱글톤 (브라우저에서만 캐시) */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    return createSupabaseClient();
  }

  if (!browserClient) {
    browserClient = createSupabaseClient();
  }

  return browserClient;
}

/**
 * Supabase 연결 테스트
 * auth.getSession()으로 API 키·URL 유효성을 확인합니다.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  const config = getSupabaseConfig();

  if (!config) {
    return {
      ok: false,
      message: "환경 변수가 설정되지 않았습니다.",
      error:
        "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY가 .env.local에 필요합니다.",
    };
  }

  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return {
        ok: false,
        message: "Supabase 연결 실패",
        url: config.url,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: "Supabase 연결 성공",
      url: config.url,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Supabase 연결 실패",
      url: config.url,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
