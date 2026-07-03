import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { logApiRouteError } from "@/lib/admin/api-route-utils";
import {
  executeCloneProject,
  executeCreateProject,
  executeDeleteProject,
  executeDeployProject,
  executeUpdateProjectPublish,
} from "@/lib/projects/actions";
import { listSites } from "@/services/site-service";
import { siteToProjectRecord } from "@/modules/sites/site-mapper";

function parseSiteBody(body: Record<string, unknown>) {
  return {
    displayName: String(body.displayName ?? ""),
    siteName: body.siteName ? String(body.siteName) : undefined,
    slug: String(body.slug ?? ""),
    domain: body.domain ? String(body.domain) : undefined,
    contactPhone: body.contactPhone ? String(body.contactPhone) : undefined,
    heroImageUrl: body.heroImageUrl ? String(body.heroImageUrl) : undefined,
    seoTitle: body.seoTitle ? String(body.seoTitle) : undefined,
    seoDescription: body.seoDescription ? String(body.seoDescription) : undefined,
    seoKeywords: body.seoKeywords ? String(body.seoKeywords) : undefined,
    cloneFromSlug: body.cloneFromSlug ? String(body.cloneFromSlug) : undefined,
  };
}

export async function GET(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;

  const sites = await listSites({ query });
  return NextResponse.json({
    success: true,
    data: sites.map(siteToProjectRecord),
  });
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const siteInput = parseSiteBody(body);

    switch (action) {
      case "create":
        return NextResponse.json(await executeCreateProject(siteInput));
      case "clone":
        return NextResponse.json(
          await executeCloneProject(String(body.sourceSlug ?? ""), siteInput),
        );
      case "delete":
        return NextResponse.json(await executeDeleteProject(String(body.slug ?? "")));
      case "publish":
        return NextResponse.json(
          await executeUpdateProjectPublish(String(body.slug ?? ""), Boolean(body.isPublished)),
        );
      case "deploy":
        return NextResponse.json(await executeDeployProject(String(body.slug ?? "")));
      default:
        return NextResponse.json({ success: false, message: `알 수 없는 action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    logApiRouteError("api/admin/projects", error);
    const message = error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
