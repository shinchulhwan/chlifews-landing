import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  getCmsEnvErrorResponse,
  logApiRouteError,
} from "@/lib/admin/api-route-utils";
import {
  executeDeleteCommunityItem,
  executeDeleteFloorplan,
  executeDeleteGalleryItem,
  executeDeletePremiumCard,
  executeReorderCommunity,
  executeReorderFloorplans,
  executeReorderGallery,
  executeReorderPremiumCards,
  executeSaveCommunity,
  executeSaveFloorplan,
  executeSaveLocation,
  executeSaveOverview,
  executeSavePremiumCard,
  executeSavePremiumSection,
  executeSetGalleryFeatured,
  executeUploadGallery,
} from "@/lib/project-content/save-handlers";

type JsonBody = {
  operation?: string;
  cardId?: string;
  itemId?: string;
  orderedIds?: string[];
};

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: "관리자 로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const envError = getCmsEnvErrorResponse();
  if (envError) {
    return envError;
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const operation = String(formData.get("operation") ?? "");

      console.log("[api/admin/project-content] POST", operation);

      switch (operation) {
        case "overview":
          return NextResponse.json(await executeSaveOverview(formData));
        case "premium-section":
          return NextResponse.json(await executeSavePremiumSection(formData));
        case "premium-card":
          return NextResponse.json(await executeSavePremiumCard(formData));
        case "location":
          return NextResponse.json(await executeSaveLocation(formData));
        case "gallery-upload":
          return NextResponse.json(await executeUploadGallery(formData));
        case "floorplan":
          return NextResponse.json(await executeSaveFloorplan(formData));
        case "community":
          return NextResponse.json(await executeSaveCommunity(formData));
        default:
          return NextResponse.json(
            { success: false, message: `알 수 없는 operation: ${operation || "(empty)"}` },
            { status: 400 },
          );
      }
    }

    const body = (await request.json()) as JsonBody;
    const operation = body.operation ?? "";

    console.log("[api/admin/project-content] POST JSON", operation);

    switch (operation) {
      case "premium-delete":
        if (!body.cardId) {
          return NextResponse.json(
            { success: false, message: "cardId가 필요합니다." },
            { status: 400 },
          );
        }
        return NextResponse.json(await executeDeletePremiumCard(body.cardId));
      case "premium-reorder":
        return NextResponse.json(
          await executeReorderPremiumCards(body.orderedIds ?? []),
        );
      case "gallery-delete":
        if (!body.itemId) {
          return NextResponse.json(
            { success: false, message: "itemId가 필요합니다." },
            { status: 400 },
          );
        }
        return NextResponse.json(await executeDeleteGalleryItem(body.itemId));
      case "gallery-featured":
        if (!body.itemId) {
          return NextResponse.json(
            { success: false, message: "itemId가 필요합니다." },
            { status: 400 },
          );
        }
        return NextResponse.json(await executeSetGalleryFeatured(body.itemId));
      case "gallery-reorder":
        return NextResponse.json(await executeReorderGallery(body.orderedIds ?? []));
      case "floorplan-delete":
        if (!body.itemId) {
          return NextResponse.json(
            { success: false, message: "itemId가 필요합니다." },
            { status: 400 },
          );
        }
        return NextResponse.json(await executeDeleteFloorplan(body.itemId));
      case "floorplan-reorder":
        return NextResponse.json(
          await executeReorderFloorplans(body.orderedIds ?? []),
        );
      case "community-delete":
        if (!body.itemId) {
          return NextResponse.json(
            { success: false, message: "itemId가 필요합니다." },
            { status: 400 },
          );
        }
        return NextResponse.json(await executeDeleteCommunityItem(body.itemId));
      case "community-reorder":
        return NextResponse.json(
          await executeReorderCommunity(body.orderedIds ?? []),
        );
      default:
        return NextResponse.json(
          { success: false, message: `알 수 없는 operation: ${operation || "(empty)"}` },
          { status: 400 },
        );
    }
  } catch (error) {
    logApiRouteError("api/admin/project-content", error);
    const message =
      error instanceof Error ? error.message : "저장 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
