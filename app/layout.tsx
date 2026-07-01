import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteAnalytics from "@/components/seo/SiteAnalytics";
import { getSiteMetadata } from "@/lib/seo/metadata";
import { getVerificationMetaTags } from "@/lib/seo/verification";
import { loadSeoMetaSettings } from "@/lib/seo-meta/load";
import { loadSiteSettings } from "@/lib/site-settings/load";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return getSiteMetadata();
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await loadSiteSettings();
  const seo = await loadSeoMetaSettings();
  const verificationTags = getVerificationMetaTags(seo);

  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <head>
        {verificationTags.map((tag) => (
          <meta key={tag.name} name={tag.name} content={tag.content} />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-white text-navy">
        {children}
        <SiteAnalytics
          settings={{
            ga4Id: settings.ga4Id,
            gtmId: settings.gtmId,
            metaPixel: settings.metaPixel,
          }}
        />
      </body>
    </html>
  );
}
