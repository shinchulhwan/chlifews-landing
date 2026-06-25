import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import Premium from "@/components/Premium";
import Location from "@/components/Location";
import Gallery from "@/components/Gallery";
import FloorPlan from "@/components/FloorPlan";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import QuickMenu from "@/components/QuickMenu";
import StructuredData from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData path="/" />
      <Header />
      <QuickMenu />
      <main className="pb-[76px] lg:pb-0">
        <Hero />
        <Overview />
        <Premium />
        <Location />
        <Gallery />
        <FloorPlan />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
