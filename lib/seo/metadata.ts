import type { Metadata } from "next";
import { OG_IMAGE_ALT, SITE_URL } from "@/lib/seo/site";
import { DEFAULT_HERO_BACKGROUND_PATH } from "@/lib/site-settings/defaults";
import { loadSeoMetaSettings, parseSeoKeywords } from "@/lib/seo-meta/load";

export async function getSiteMetadata(): Promise<Metadata> {
  const settings = await loadSeoMetaSettings();
  const siteUrl = settings.canonicalUrl || SITE_URL;
  const metadataBase = new URL(siteUrl);

  const ogImagePath = settings.ogImage || DEFAULT_HERO_BACKGROUND_PATH;
  const ogImageUrl = ogImagePath.startsWith("http")
    ? ogImagePath
    : new URL(ogImagePath, metadataBase).toString();

  const twitterImagePath = settings.twitterImage || ogImagePath;
  const twitterImageUrl = twitterImagePath.startsWith("http")
    ? twitterImagePath
    : new URL(twitterImagePath, metadataBase).toString();

  const indexable = settings.robots !== "noindex";

  const icons: Metadata["icons"] = {};
  if (settings.favicon) {
    icons.icon = settings.favicon;
  }
  if (settings.appleIcon) {
    icons.apple = settings.appleIcon;
  }

  const twitterCard = settings.twitterCard as
    | "summary"
    | "summary_large_image"
    | "app"
    | "player";

  return {
    metadataBase,
    applicationName: settings.siteName,
    title: {
      default: settings.metaTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.metaDescription,
    keywords: parseSeoKeywords(settings.metaKeywords),
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
      title: settings.ogTitle,
      description: settings.ogDescription,
      type: settings.ogType === "article" ? "article" : "website",
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
      card: twitterCard,
      title: settings.twitterTitle,
      description: settings.twitterDescription,
      images: [twitterImageUrl],
    },
    icons: Object.keys(icons).length > 0 ? icons : undefined,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}
