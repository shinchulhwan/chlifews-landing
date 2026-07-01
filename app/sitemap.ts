import type { MetadataRoute } from "next";
import { loadSiteSettings } from "@/lib/site-settings/load";
import { SITE_URL } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await loadSiteSettings();

  if (!settings.sitemapAutoGenerate) {
    return [];
  }

  const siteUrl = settings.canonicalUrl || SITE_URL;

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
