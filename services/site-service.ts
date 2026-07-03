import { revalidatePath } from "next/cache";
import { projectRecordToSite } from "@/modules/sites/site-mapper";
import { resolveCloneSource } from "@/lib/projects/clone";
import {
  createProjectRecord,
  getProjectBySlug,
  getProjectBySiteName,
  listProjects,
  updateProjectRecord,
} from "@/lib/projects/storage";
import { validateProjectSlug, normalizeProjectSlug, buildSiteNameFromProject } from "@/lib/projects/slugs";
import { getProjectDeployUrl } from "@/lib/projects/resolve";
import { getDeployService } from "@/lib/deploy";
import { cloneSiteContent } from "@/services/clone-service";
import {
  applyInitialSiteSettings,
  applySeoConfig,
  seoConfigFromCreateInput,
} from "@/services/seo-service";
import type { CreateSiteInput, Site, SiteListFilters } from "@/types/site";
import type { ProjectRecord } from "@/lib/projects/types";

function revalidateSitePaths(site: Pick<Site, "slug" | "isDefault">): void {
  try {
    revalidatePath("/");
    if (!site.isDefault) revalidatePath(`/${site.slug}`);
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/projects");
  } catch (error) {
    console.warn("[site-service:revalidate]", error);
  }
}

export async function listSites(filters: SiteListFilters = {}): Promise<Site[]> {
  const records = await listProjects({
    query: filters.query,
    publishedOnly: filters.publishedOnly,
  });

  let sites = records.map(projectRecordToSite);

  if (filters.status) {
    sites = sites.filter((s) => s.status === filters.status);
  }

  return sites;
}

export async function getSiteBySlug(slug: string): Promise<Site | null> {
  const record = await getProjectBySlug(slug);
  return record ? projectRecordToSite(record) : null;
}

export async function getSiteBySiteName(siteName: string): Promise<Site | null> {
  const record = await getProjectBySiteName(siteName);
  return record ? projectRecordToSite(record) : null;
}

export async function getStorageSlugForSiteName(siteName: string): Promise<string | undefined> {
  const site = await getSiteBySiteName(siteName);
  return site?.storageSlug;
}

export async function createSite(input: CreateSiteInput): Promise<Site> {
  const slug = normalizeProjectSlug(input.slug);
  const slugError = validateProjectSlug(slug);
  if (slugError) throw new Error(slugError);

  const displayName = input.displayName.trim() || slug;
  const siteName = (input.siteName?.trim() || buildSiteNameFromProject(displayName, slug)).trim();
  if (!siteName) throw new Error("사이트명을 입력해 주세요.");

  const source = await resolveCloneSource(input.cloneFromSlug);

  const project = await createProjectRecord({
    displayName,
    slug,
    siteName,
    domain: input.domain,
    clonedFromId: source.id !== "legacy-default" ? source.id : null,
  });

  const cloneResult = await cloneSiteContent(source, project);

  const seoOverride = seoConfigFromCreateInput(input);
  await applyInitialSiteSettings(
    project.site_name,
    { ...input, displayName, siteName },
    seoOverride,
  );

  if (input.heroImageUrl?.trim() && seoOverride.ogImage === undefined) {
    await applySeoConfig(project.site_name, { ogImage: input.heroImageUrl.trim() });
  }

  const site = projectRecordToSite(project);
  revalidateSitePaths(site);

  if (cloneResult.storageErrors.length > 0) {
    console.warn("[site-service:create] storage copy warnings:", cloneResult.storageErrors);
  }

  return site;
}

export async function cloneSite(
  sourceSlug: string,
  input: CreateSiteInput,
): Promise<Site> {
  return createSite({ ...input, cloneFromSlug: sourceSlug });
}

export async function deploySite(slug: string): Promise<{
  site: Site;
  deployMessage: string;
}> {
  const record = await getProjectBySlug(slug);
  if (!record) throw new Error("사이트를 찾을 수 없습니다.");

  const site = projectRecordToSite(record);
  const deployService = getDeployService();
  const previousStatus = site.status;

  await updateProjectRecord(slug, { status: "deploying" });

  const result = await deployService.deploy({
    siteId: site.id,
    slug: site.slug,
    domain: site.domain,
  });

  await updateProjectRecord(slug, { status: previousStatus });

  const deployMessage = result.message || "Deploy 기능 준비중";

  return { site: { ...site, status: previousStatus }, deployMessage };
}

export function getSitePublicUrl(site: Pick<Site, "slug" | "isDefault">): string {
  if (site.isDefault) return "/";
  return `/${site.slug}`;
}

export function getSiteDeployUrl(site: Pick<Site, "slug" | "isDefault" | "domain">): string {
  return getProjectDeployUrl({
    slug: site.slug,
    is_default: site.isDefault,
    domain: site.domain,
  });
}

/** @deprecated use Site type — 하위 호환 */
export type { ProjectRecord };
