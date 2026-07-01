import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import Premium from "@/components/Premium";
import Location from "@/components/Location";
import Gallery from "@/components/Gallery";
import Community from "@/components/Community";
import FloorPlan from "@/components/FloorPlan";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import QuickMenu from "@/components/QuickMenu";
import { LightboxProvider } from "@/components/lightbox";
import StructuredData from "@/components/seo/StructuredData";
import { getHeroBackgroundSetting } from "@/lib/storage/site-settings";
import {
  getProjectCommunity,
  getProjectFloorplans,
  getProjectGallery,
  getProjectLocation,
  getProjectOverview,
  getProjectPremium,
} from "@/lib/storage/project-content";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [
    heroBackgroundUrl,
    overviewData,
    premiumData,
    locationData,
    galleryItems,
    communityItems,
    floorplanItems,
  ] = await Promise.all([
    getHeroBackgroundSetting(),
    getProjectOverview(),
    getProjectPremium(),
    getProjectLocation(),
    getProjectGallery(),
    getProjectCommunity(),
    getProjectFloorplans(),
  ]);

  return (
    <>
      <StructuredData path="/" />
      <Header />
      <QuickMenu />
      <main className="pb-[76px] lg:pb-0">
        <LightboxProvider>
          <Hero
            initialBackgroundUrl={heroBackgroundUrl?.url ?? null}
            initialUpdatedAt={heroBackgroundUrl?.updated_at ?? null}
          />
          <Overview initialData={overviewData} />
          <Premium initialData={premiumData} />
          <Location initialData={locationData} />
          <Gallery initialItems={galleryItems} />
          <Community initialItems={communityItems} />
          <FloorPlan initialItems={floorplanItems} />
          <CTA />
        </LightboxProvider>
      </main>
      <Footer />
    </>
  );
}
