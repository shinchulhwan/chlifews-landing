import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { executeUploadHeroBackground } from "@/lib/site-settings/save-handlers";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: "관리자 로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    console.log("[api/admin/hero-background] POST");
    const result = await executeUploadHeroBackground(formData);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장 중 알 수 없는 오류가 발생했습니다.";
    console.error("[api/admin/hero-background] Unhandled error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
