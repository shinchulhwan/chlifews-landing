import { NextResponse } from "next/server";
import {
  getProjectCommunity,
  getProjectFloorplans,
  getProjectGallery,
  getProjectLocation,
  getProjectOverview,
  getProjectPremium,
} from "@/lib/storage/project-content";
import type { ProjectContentSection } from "@/lib/types/project-content";

const HANDLERS: Record<
  ProjectContentSection,
  () => Promise<unknown>
> = {
  overview: getProjectOverview,
  premium: getProjectPremium,
  location: getProjectLocation,
  gallery: getProjectGallery,
  community: getProjectCommunity,
  floorplans: getProjectFloorplans,
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ section: string }> },
) {
  const { section } = await context.params;
  const handler = HANDLERS[section as ProjectContentSection];

  if (!handler) {
    return NextResponse.json(
      { success: false, message: "Unknown section" },
      { status: 404 },
    );
  }

  try {
    const data = await handler();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load content";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
