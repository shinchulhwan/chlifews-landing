import type { Metadata } from "next";
import { OG_IMAGE_ALT, SITE_URL } from "@/lib/seo/site";
import { DEFAULT_HERO_BACKGROUND_PATH } from "@/lib/site-settings/defaults";
import { loadSiteSettings, parseSeoKeywords } from "@/lib/site-settings/load";

export async function getSiteMetadata(): Promise<Metadata> {
  const settings = await loadSiteSettings();
  const siteUrl = settings.canonicalUrl || SITE_URL;
  const metadataBase = new URL(siteUrl);

  const ogImagePath = settings.ogImage || DEFAULT_HERO_BACKGROUND_PATH;
  const ogImageUrl = ogImagePath.startsWith("http")
    ? ogImagePath
    : new URL(ogImagePath, metadataBase).toString();

  const indexable = settings.robots !== "noindex";

  const verification: Metadata["verification"] = {};
  if (settings.googleVerification) {
    verification.google = settings.googleVerification;
  }
  if (settings.naverVerification) {
    verification.other = {
      "naver-site-verification": settings.naverVerification,
    };
  }

  const icons: Metadata["icons"] = {};
  if (settings.favicon) {
    icons.icon = settings.favicon;
  }
  if (settings.appleIcon) {
    icons.apple = settings.appleIcon;
  }

  return {
    metadataBase,
    applicationName: settings.siteName,
    title: {
      default: settings.seoTitle || settings.browserTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.seoDescription || settings.mainDescription,
    keywords: parseSeoKeywords(settings.seoKeywords),
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      siteName: settings.siteName,
      title: settings.ogTitle || settings.seoTitle,
      description: settings.ogDescription || settings.seoDescription,
      type: "website",
      locale: "ko_KR",
      url: settings.ogUrl || siteUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.ogTitle || settings.seoTitle,
      description: settings.ogDescription || settings.seoDescription,
      images: [ogImageUrl],
    },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
    icons: Object.keys(icons).length > 0 ? icons : undefined,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}
