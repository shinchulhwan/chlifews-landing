import { listProjects } from "@/lib/projects/storage";
import type { MetadataRoute } from "next";
import { buildSitemapConfig, buildSitemapEntries, resolvePublicSiteUrl } from "@/lib/seo/metadata-routes";
import { loadSiteSettings } from "@/lib/site-settings/load";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await loadSiteSettings();
  if (!settings.sitemapAutoGenerate) {
    return [];
  }

  const projects = await listProjects({ publishedOnly: true });
  const siteUrl = resolvePublicSiteUrl(settings.canonicalUrl);

  if (projects.length === 0) {
    return buildSitemapConfig(settings);
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const project of projects) {
    const path = project.is_default ? "/" : `/${project.slug}`;
    const url = path === "/" ? siteUrl : `${siteUrl.replace(/\/$/, "")}${path}`;
    entries.push({
      url,
      lastModified: new Date(project.updated_at),
      changeFrequency: "weekly",
      priority: project.is_default ? 1 : 0.8,
    });
  }

  return entries.length > 0 ? entries : buildSitemapEntries(siteUrl);
}
