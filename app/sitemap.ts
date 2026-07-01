import type { MetadataRoute } from "next";
import { buildSitemapConfig } from "@/lib/seo/metadata-routes";
import { loadSiteSettings } from "@/lib/site-settings/load";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await loadSiteSettings();
  return buildSitemapConfig(settings);
}
