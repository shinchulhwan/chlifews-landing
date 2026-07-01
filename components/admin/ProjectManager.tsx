"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Rocket,
  Search,
  Trash2,
} from "lucide-react";
import { setActiveProjectSlug } from "@/lib/actions/admin-project";
import { getProjectDeployUrl, getProjectPublicUrl } from "@/lib/projects/resolve";
import type { ProjectRecord } from "@/lib/projects/types";
import AdminPageShell, {
  AdminToast,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  useAdminToast,
} from "@/components/admin/AdminPageShell";

type ProjectManagerProps = {
  initialProjects: ProjectRecord[];
  activeSlug: string | null;
};

async function postProjectAction(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  return response.json();
}

export default function ProjectManager({
  initialProjects,
  activeSlug,
}: ProjectManagerProps) {
  const { toast, setToast } = useAdminToast();
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    slug: "",
    domain: "",
    cloneFromSlug: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        p.site_name.toLowerCase().includes(q),
    );
  }, [projects, query]);

  async function handleCreate() {
    setSaving(true);
    try {
      const result = await postProjectAction({
        action: form.cloneFromSlug ? "clone" : "create",
        displayName: form.displayName,
        slug: form.slug,
        domain: form.domain || undefined,
        cloneFromSlug: form.cloneFromSlug || undefined,
        sourceSlug: form.cloneFromSlug || undefined,
      });

      if (result.success && result.data) {
        setProjects((prev) => [result.data, ...prev]);
        setToast({ type: "success", message: result.message });
        setForm({ displayName: "", slug: "", domain: "", cloneFromSlug: "" });
      } else {
        setToast({ type: "error", message: result.message });
      }
    } catch {
      setToast({ type: "error", message: "프로젝트 생성에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handleClone(source: ProjectRecord) {
    const slug = window.prompt("새 URL Slug를 입력하세요", `${source.slug}-copy`);
    if (!slug) return;
    const displayName = window.prompt("프로젝트명", `${source.display_name} 복제`);
    if (!displayName) return;

    setSaving(true);
    try {
      const result = await postProjectAction({
        action: "clone",
        sourceSlug: source.slug,
        slug,
        displayName,
      });
      if (result.success && result.data) {
        setProjects((prev) => [result.data, ...prev]);
        setToast({ type: "success", message: "프로젝트가 복제되었습니다." });
      } else {
        setToast({ type: "error", message: result.message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(project: ProjectRecord) {
    const result = await postProjectAction({
      action: "publish",
      slug: project.slug,
      isPublished: !project.is_published,
    });
    if (result.success && result.data) {
      setProjects((prev) => prev.map((p) => (p.slug === project.slug ? result.data : p)));
      setToast({ type: "success", message: result.message });
    } else {
      setToast({ type: "error", message: result.message });
    }
  }

  async function handleDeploy(project: ProjectRecord) {
    const result = await postProjectAction({ action: "deploy", slug: project.slug });
    if (result.success) {
      setProjects((prev) =>
        prev.map((p) => (p.slug === project.slug ? { ...p, is_published: true } : p)),
      );
      setToast({ type: "success", message: `${result.message} ${result.data?.url ?? ""}` });
    } else {
      setToast({ type: "error", message: result.message });
    }
  }

  async function handleDelete(project: ProjectRecord) {
    if (!window.confirm(`"${project.display_name}" 프로젝트를 삭제할까요?`)) return;
    const result = await postProjectAction({ action: "delete", slug: project.slug });
    if (result.success) {
      setProjects((prev) => prev.filter((p) => p.slug !== project.slug));
      setToast({ type: "success", message: result.message });
    } else {
      setToast({ type: "error", message: result.message });
    }
  }

  async function handleSelect(project: ProjectRecord) {
    await setActiveProjectSlug(project.slug);
    setToast({ type: "success", message: `편집 프로젝트: ${project.display_name}` });
  }

  return (
    <AdminPageShell
      title="프로젝트 관리"
      description="CH Labs Landing Builder — 프로젝트 생성·복제·배포를 관리합니다."
    >
      <div className="mx-auto max-w-5xl space-y-8 pb-8">
        <AdminToast toast={toast} />

        <section className={adminCardClass}>
          <h2 className="text-lg font-semibold text-navy">새 프로젝트 생성</h2>
          <p className="mt-1 text-sm text-navy/60">
            기본 템플릿(현재 기본 프로젝트)을 복사해 5분 안에 새 랜딩을 시작할 수 있습니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>프로젝트명</label>
              <input
                className={adminInputClass}
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="예) 시티오씨엘"
              />
            </div>
            <div>
              <label className={adminLabelClass}>URL Slug</label>
              <input
                className={adminInputClass}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="예) cityociel"
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>도메인 (선택)</label>
              <input
                className={adminInputClass}
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>복제 원본 Slug (선택)</label>
              <input
                className={adminInputClass}
                value={form.cloneFromSlug}
                onChange={(e) => setForm((f) => ({ ...f, cloneFromSlug: e.target.value }))}
                placeholder="비우면 기본 템플릿 사용"
                dir="ltr"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleCreate}
              className={adminPrimaryButtonClass}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              프로젝트 생성
            </button>
          </div>
        </section>

        <section className={adminCardClass}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">프로젝트 목록</h2>
              <p className="mt-1 text-sm text-navy/60">
                편집할 프로젝트를 선택한 뒤 CMS 메뉴에서 콘텐츠를 수정하세요.
              </p>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" size={16} />
              <input
                className={`${adminInputClass} pl-9`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색..."
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((project) => {
              const publicPath = getProjectPublicUrl(project);
              const deployUrl = getProjectDeployUrl(project);
              const isActive = activeSlug === project.slug;

              return (
                <div
                  key={project.id}
                  className={`rounded-xl border p-4 ${isActive ? "border-gold bg-gold/5" : "border-navy/10"}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-navy">{project.display_name}</h3>
                        {project.is_default && (
                          <span className="rounded-full bg-navy px-2 py-0.5 text-xs text-white">
                            기본
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            project.is_published
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-navy/10 text-navy/60"
                          }`}
                        >
                          {project.is_published ? "공개" : "비공개"}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-navy">
                            편집 중
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-navy/60">
                        <span className="font-mono">/{project.slug}</span>
                        <span className="mx-2 text-navy/30">·</span>
                        {project.site_name}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelect(project)}
                        className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-medium text-navy hover:bg-light-gray"
                      >
                        편집 선택
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(project)}
                        className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-medium text-navy hover:bg-light-gray"
                      >
                        <Globe size={14} className="mr-1 inline" />
                        {project.is_published ? "비공개" : "공개"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeploy(project)}
                        className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-medium text-navy hover:bg-gold/20"
                      >
                        <Rocket size={14} className="mr-1 inline" />
                        배포
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClone(project)}
                        className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-medium text-navy hover:bg-light-gray"
                      >
                        <Copy size={14} className="mr-1 inline" />
                        복제
                      </button>
                      {project.is_published && (
                        <Link
                          href={publicPath}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-navy/15 px-3 py-2 text-sm font-medium text-navy hover:bg-light-gray"
                        >
                          <ExternalLink size={14} />
                          보기
                        </Link>
                      )}
                      {!project.is_default && (
                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="mr-1 inline" />
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-navy/45" dir="ltr">
                    {deployUrl}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
