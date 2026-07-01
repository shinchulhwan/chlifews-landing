import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteAnalytics from "@/components/seo/SiteAnalytics";
import { getDefaultProject, ensureDefaultProjectSeeded } from "@/lib/projects/storage";
import { loadSiteSettings } from "@/lib/site-settings/load";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
  await ensureDefaultProjectSeeded();
  const project = await getDefaultProject();
  const settings = await loadSiteSettings(project?.site_name);

  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
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
