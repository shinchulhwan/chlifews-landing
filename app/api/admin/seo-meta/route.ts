import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { logApiRouteError } from "@/lib/admin/api-route-utils";
import { SEO_META_SETTING_KEYS } from "@/lib/site-settings/keys";
import { executeSaveSeoMetaField } from "@/lib/seo-meta/save";

const ALLOWED_KEYS = new Set<string>(SEO_META_SETTING_KEYS);

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: "관리자 로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const key = String(formData.get("key") ?? "").trim();

    if (!key || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json(
        { success: false, message: `알 수 없는 key: ${key || "(empty)"}` },
        { status: 400 },
      );
    }

    console.log("[api/admin/seo-meta] POST", key);
    const result = await executeSaveSeoMetaField(key, formData);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    logApiRouteError("api/admin/seo-meta", error);
    const message =
      error instanceof Error ? error.message : "저장 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
