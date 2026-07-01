import { revalidatePath } from "next/cache";
import { cloneProjectContent, resolveCloneSource } from "@/lib/projects/clone";
import {
  createProjectRecord,
  getProjectBySlug,
} from "@/lib/projects/storage";
import type { CreateProjectInput, ProjectRecord } from "@/lib/projects/types";
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

export async function executeCreateProject(
  input: CreateProjectInput,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  try {
    const source = await resolveCloneSource(input.cloneFromSlug);
    const project = await createProjectRecord({
      ...input,
      clonedFromId: source.id !== "legacy-default" ? source.id : null,
    });

    await cloneProjectContent(source, project);
    revalidateProjectPaths(project);

    return {
      success: true,
      message: "프로젝트가 생성되었습니다. 템플릿 콘텐츠가 복사되었습니다.",
      data: project,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "프로젝트 생성에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeCloneProject(
  sourceSlug: string,
  input: CreateProjectInput,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  return executeCreateProject({ ...input, cloneFromSlug: sourceSlug });
}

export async function executeDeleteProject(
  slug: string,
): Promise<ProjectContentActionResult<null>> {
  try {
    const { deleteProjectRecord } = await import("@/lib/projects/storage");
    await deleteProjectRecord(slug);
    revalidateProjectPaths({ slug, is_default: false } as ProjectRecord);
    return { success: true, message: "프로젝트가 삭제되었습니다.", data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeUpdateProjectPublish(
  slug: string,
  isPublished: boolean,
): Promise<ProjectContentActionResult<ProjectRecord>> {
  try {
    const { updateProjectRecord } = await import("@/lib/projects/storage");
    const project = await updateProjectRecord(slug, { is_published: isPublished });
    revalidateProjectPaths(project);
    return {
      success: true,
      message: isPublished ? "프로젝트가 공개되었습니다." : "프로젝트가 비공개로 전환되었습니다.",
      data: project,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "상태 변경에 실패했습니다.";
    return { success: false, message };
  }
}

export async function executeDeployProject(
  slug: string,
): Promise<ProjectContentActionResult<{ url: string }>> {
  try {
    const { updateProjectRecord } = await import("@/lib/projects/storage");
    const { getProjectDeployUrl } = await import("@/lib/projects/resolve");
    const project = await updateProjectRecord(slug, { is_published: true });
    revalidateProjectPaths(project);
    const url = getProjectDeployUrl(project);
    return {
      success: true,
      message: "프로젝트가 배포(공개)되었습니다.",
      data: { url },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "배포에 실패했습니다.";
    return { success: false, message };
  }
}

export async function getProjectForAdmin(slug: string): Promise<ProjectRecord | null> {
  return getProjectBySlug(slug);
}
