import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { getDefaultProject, ensureDefaultProjectSeeded } from "@/lib/projects/storage";
import { getSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  await ensureDefaultProjectSeeded();
  const project = await getDefaultProject();
  const base = await getSiteMetadata(project?.site_name);
  return {
    ...base,
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  await ensureDefaultProjectSeeded();
  const project = await getDefaultProject();
  const siteName = project?.site_name ?? "";

  return <LandingPage siteName={siteName} canonicalPath="/" />;
}
