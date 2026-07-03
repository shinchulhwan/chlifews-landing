import { revalidatePath } from "next/cache";
import { siteToProjectRecord } from "@/modules/sites/site-mapper";
import {
  createSite,
  cloneSite,
  deploySite,
} from "@/services/site-service";
import type { CreateSiteInput, CreateProjectInput, ProjectRecord } from "@/lib/projects/types";
import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";

function revalidateProjectPaths(project: ProjectRecord): void {
  try {
    revalidatePath("/");
    revalidatePath(`/${project.slug}`);
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/projects");
  } catch (error) {
    console.warn("[projects:revalidate]", error);
  }
}

function parseCreateInput(input: CreateProjectInput): CreateSiteInput {
  return {
    displayName: input.displayName,
    siteName: input.siteName,
    slug: input.slug,
    domain: input.domain,
    contactPhone: input.contactPhone,
    heroImageUrl: input.heroImageUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoKeywords: input.seoKeywords,
    cloneFromSlug: input.cloneFromSlug,
  };
}

export async function executeCreateProject(
  input: CreateProjectInput,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  try {
    const site = await createSite(parseCreateInput(input));
    const project = siteToProjectRecord(site);
    revalidateProjectPaths(project);

    return {
      success: true,
      message: "사이트가 생성되었습니다. 템플릿 콘텐츠·설정·이미지가 복사되었습니다.",
      data: project,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "사이트 생성에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeCloneProject(
  sourceSlug: string,
  input: CreateProjectInput,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  try {
    const site = await cloneSite(sourceSlug, parseCreateInput(input));
    const project = siteToProjectRecord(site);
    revalidateProjectPaths(project);

    return {
      success: true,
      message: "사이트가 복제되었습니다.",
      data: project,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "사이트 복제에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeDeleteProject(
  slug: string,
): Promise<ProjectContentActionResult<null>> {
  try {
    const { deleteProjectRecord } = await import("@/lib/projects/storage");
    await deleteProjectRecord(slug);
    revalidateProjectPaths({ slug, is_default: false } as ProjectRecord);
    return { success: true, message: "사이트가 삭제되었습니다.", data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "사이트 삭제에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeUpdateProjectPublish(
  slug: string,
  isPublished: boolean,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  try {
    const { updateProjectRecord } = await import("@/lib/projects/storage");
    const project = await updateProjectRecord(slug, {
      is_published: isPublished,
      status: isPublished ? "published" : "draft",
    });
    revalidateProjectPaths(project);
    return {
      success: true,
      message: isPublished ? "사이트가 공개되었습니다." : "사이트가 비공개로 전환되었습니다.",
      data: project,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "상태 변경에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeDeployProject(
  slug: string,
): Promise<ProjectContentActionResult<{ url: string; message: string }>> {
  try {
    const { deployMessage, site } = await deploySite(slug);
    const { getProjectDeployUrl } = await import("@/lib/projects/resolve");
    const project = siteToProjectRecord(site);
    revalidateProjectPaths(project);

    return {
      success: true,
      message: deployMessage,
      data: {
        url: getProjectDeployUrl(project),
        message: deployMessage,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deploy 기능 준비중";
    return { success: true, message, data: { url: "", message } };
  }
}

export async function getProjectForAdmin(slug: string): Promise<ProjectRecord | null> {
  const { getProjectBySlug } = await import("@/lib/projects/storage");
  return getProjectBySlug(slug);
}
