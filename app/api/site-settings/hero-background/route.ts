import { NextResponse } from "next/server";
import { getHeroBackgroundUrl } from "@/lib/storage/site-settings";

export async function GET(): Promise<NextResponse> {
  const url = await getHeroBackgroundUrl();

  return NextResponse.json(
    { key: "hero_background", value: url },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
