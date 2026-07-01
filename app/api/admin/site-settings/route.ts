import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { logApiRouteError } from "@/lib/admin/api-route-utils";
import type { SiteSettingsSectionId } from "@/lib/site-settings/fields";
import { executeSaveSiteSettingsSection } from "@/lib/site-settings/save-site-settings";

const VALID_SECTIONS = new Set<SiteSettingsSectionId>([
  "basic",
  "seo",
  "og",
  "search",
  "favicon",
  "sitemap",
]);

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: "관리자 로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const section = String(formData.get("section") ?? "") as SiteSettingsSectionId;

    if (!VALID_SECTIONS.has(section)) {
      return NextResponse.json(
        { success: false, message: `알 수 없는 section: ${section || "(empty)"}` },
        { status: 400 },
      );
    }

    console.log("[api/admin/site-settings] POST", section);
    const result = await executeSaveSiteSettingsSection(section, formData);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    logApiRouteError("api/admin/site-settings", error);
    const message =
      error instanceof Error ? error.message : "저장 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
