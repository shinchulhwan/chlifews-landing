import { NextResponse } from "next/server";
import { getSiteNameFromEnv } from "@/lib/config/site";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

export function getCmsEnvErrorResponse(): NextResponse | null {
  const siteName = getSiteNameFromEnv();
  if (!siteName) {
    return NextResponse.json(
      {
        success: false,
        message:
          "SITE_NAME 환경 변수가 설정되지 않았습니다. Vercel Production 환경 변수에 SITE_NAME을 등록하세요.",
      },
      { status: 500 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Vercel Production 환경 변수를 확인하세요.",
      },
      { status: 500 },
    );
  }

  return null;
}

export function logApiRouteError(route: string, error: unknown): void {
  console.error(`[${route}] Unhandled error:`, error);
  if (error instanceof Error && error.stack) {
    console.error(`[${route}] stack:`, error.stack);
  }
}
