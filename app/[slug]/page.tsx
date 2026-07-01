import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import { RESERVED_PROJECT_SLUGS } from "@/lib/projects/slugs";
import { getPublishedProjectBySlug } from "@/lib/projects/storage";
import { getSiteMetadata } from "@/lib/seo/metadata";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const base = await getSiteMetadata(project.site_name);
  return {
    ...base,
    alternates: { canonical: `/${project.slug}` },
  };
}

export default async function ProjectLandingPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (RESERVED_PROJECT_SLUGS.has(slug)) {
    notFound();
  }

  const project = await getPublishedProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  return (
    <LandingPage
      siteName={project.site_name}
      canonicalPath={`/${project.slug}`}
    />
  );
}
