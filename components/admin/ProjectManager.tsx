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
import type { ProjectRecord, SiteStatus } from "@/lib/projects/types";
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

const STATUS_LABELS: Record<SiteStatus, string> = {
  draft: "초안",
  published: "공개",
  deploying: "배포 중",
  deployed: "배포됨",
  failed: "실패",
};

const emptyForm = {
  displayName: "",
  siteName: "",
  slug: "",
  domain: "",
  contactPhone: "",
  heroImageUrl: "",
  seoTitle: "",
  seoDescription: "",
  cloneFromSlug: "",
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
  const [form, setForm] = useState(emptyForm);

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
        siteName: form.siteName || undefined,
        slug: form.slug,
        domain: form.domain || undefined,
        contactPhone: form.contactPhone || undefined,
        heroImageUrl: form.heroImageUrl || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        cloneFromSlug: form.cloneFromSlug || undefined,
        sourceSlug: form.cloneFromSlug || undefined,
      });

      if (result.success && result.data) {
        setProjects((prev) => [result.data, ...prev]);
        setToast({ type: "success", message: result.message });
        setForm(emptyForm);
      } else {
        setToast({ type: "error", message: result.message });
      }
    } catch {
      setToast({ type: "error", message: "사이트 생성에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handleClone(source: ProjectRecord) {
    const slug = window.prompt("새 URL Slug를 입력하세요", `${source.slug}-copy`);
    if (!slug) return;
    const displayName = window.prompt("프로젝트명", `${source.display_name} 복제`);
    if (!displayName) return;
    const siteName = window.prompt("사이트명", `${source.site_name} 복제`) ?? displayName;

    setSaving(true);
    try {
      const result = await postProjectAction({
        action: "clone",
        sourceSlug: source.slug,
        slug,
        displayName,
        siteName,
      });
      if (result.success && result.data) {
        setProjects((prev) => [result.data, ...prev]);
        setToast({ type: "success", message: result.message });
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
    const message = result.data?.message ?? result.message ?? "Deploy 기능 준비중";
    setToast({ type: "success", message });
  }

  async function handleDelete(project: ProjectRecord) {
    if (!window.confirm(`"${project.display_name}" 사이트를 삭제할까요?`)) return;
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
    setToast({ type: "success", message: `편집 사이트: ${project.display_name}` });
  }

  return (
    <AdminPageShell
      title="사이트 관리"
      description="CH Labs Landing Builder — 독립 사이트 생성·복제·배포를 관리합니다."
    >
      <div className="mx-auto max-w-5xl space-y-8 pb-8">
        <AdminToast toast={toast} />

        <section className={adminCardClass}>
          <h2 className="text-lg font-semibold text-navy">새 사이트 생성</h2>
          <p className="mt-1 text-sm text-navy/60">
            기존 사이트를 복제해 DB·이미지·SEO·설정을 독립 프로젝트로 생성합니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>프로젝트명 *</label>
              <input
                className={adminInputClass}
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="예) 시티오씨엘"
              />
            </div>
            <div>
              <label className={adminLabelClass}>사이트명</label>
              <input
                className={adminInputClass}
                value={form.siteName}
                onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
                placeholder="CMS 식별명 (비우면 자동)"
              />
            </div>
            <div>
              <label className={adminLabelClass}>Slug *</label>
              <input
                className={adminInputClass}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="예) cityociel"
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>대표 도메인 (선택)</label>
              <input
                className={adminInputClass}
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>전화번호</label>
              <input
                className={adminInputClass}
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="1844-0148"
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>대표 이미지 URL</label>
              <input
                className={adminInputClass}
                value={form.heroImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div>
              <label className={adminLabelClass}>SEO 제목</label>
              <input
                className={adminInputClass}
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                placeholder="브라우저 탭 제목"
              />
            </div>
            <div>
              <label className={adminLabelClass}>SEO 설명</label>
              <input
                className={adminInputClass}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                placeholder="메타 description"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={adminLabelClass}>복제 원본 Slug (선택)</label>
              <input
                className={adminInputClass}
                value={form.cloneFromSlug}
                onChange={(e) => setForm((f) => ({ ...f, cloneFromSlug: e.target.value }))}
                placeholder="비우면 기본 사이트에서 복제"
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
              사이트 생성
            </button>
          </div>
        </section>

        <section className={adminCardClass}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">사이트 목록</h2>
              <p className="mt-1 text-sm text-navy/60">
                편집할 사이트를 선택한 뒤 CMS·SEO 메뉴에서 콘텐츠를 수정하세요.
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
              const status = project.status ?? (project.is_published ? "published" : "draft");

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
                        <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs text-navy/70">
                          {STATUS_LABELS[status]}
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
                        Deploy
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
