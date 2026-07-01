import type { MetadataRoute } from "next";
import { loadSiteSettings } from "@/lib/site-settings/load";
import { SITE_URL } from "@/lib/seo/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await loadSiteSettings();
  const siteUrl = settings.canonicalUrl || SITE_URL;

  if (!settings.robotsAutoGenerate) {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
    };
  }

  const indexable = settings.robots !== "noindex";

  return {
    rules: [
      {
        userAgent: "*",
        allow: indexable ? "/" : undefined,
        disallow: indexable ? ["/admin/", "/api/"] : "/",
      },
    ],
    sitemap: settings.sitemapAutoGenerate ? `${siteUrl}/sitemap.xml` : undefined,
    host: siteUrl,
  };
}
