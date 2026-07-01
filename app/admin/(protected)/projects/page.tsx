import ProjectManager from "@/components/admin/ProjectManager";
import { getActiveProjectSlugFromCookie } from "@/lib/admin/project-context";
import { ensureDefaultProjectSeeded, listProjects } from "@/lib/projects/storage";

export const metadata = {
  title: "프로젝트 관리",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  await ensureDefaultProjectSeeded();
  const [projects, activeSlug] = await Promise.all([
    listProjects(),
    getActiveProjectSlugFromCookie(),
  ]);

  return <ProjectManager initialProjects={projects} activeSlug={activeSlug} />;
}
