import type { MetadataRoute } from "next";
import { buildRobotsConfig } from "@/lib/seo/metadata-routes";
import { loadSiteSettings } from "@/lib/site-settings/load";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await loadSiteSettings();
  return buildRobotsConfig(settings);
}
