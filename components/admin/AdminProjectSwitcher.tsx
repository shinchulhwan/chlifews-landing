import Link from "next/link";
import { resolveAdminProject } from "@/lib/admin/project-context";
import { getProjectPublicUrl } from "@/lib/projects/resolve";

export default async function AdminProjectSwitcher() {
  const project = await resolveAdminProject();
  if (!project) return null;

  return (
    <div className="border-b border-navy/10 bg-light-gray/50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p className="text-navy/70">
          편집 중:{" "}
          <span className="font-semibold text-navy">{project.display_name}</span>
          <span className="mx-2 text-navy/30">·</span>
          <span className="font-mono text-xs">{project.site_name}</span>
        </p>
        <div className="flex gap-3">
          <Link href="/admin/projects" className="font-medium text-gold hover:underline">
            프로젝트 변경
          </Link>
          {project.is_published && (
            <Link
              href={getProjectPublicUrl(project)}
              target="_blank"
              className="text-navy/60 hover:text-navy"
            >
              미리보기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
