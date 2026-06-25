import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase";

/**
 * Supabase 연결 테스트 API
 * GET http://localhost:3000/api/supabase/test
 */
export async function GET() {
  const result = await testSupabaseConnection();

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
