import type { Metadata } from "next";
import {
  OPEN_GRAPH_DESCRIPTION,
  OPEN_GRAPH_TITLE,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo/site";

export function getSiteMetadata(): Metadata {
  const ogImageUrl = new URL(OG_IMAGE_PATH, SITE_URL).toString();

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_BRAND,
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_BRAND}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      siteName: SITE_BRAND,
      title: OPEN_GRAPH_TITLE,
      description: OPEN_GRAPH_DESCRIPTION,
      type: "website",
      locale: "ko_KR",
      url: SITE_URL,
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
      title: OPEN_GRAPH_TITLE,
      description: OPEN_GRAPH_DESCRIPTION,
      images: [ogImageUrl],
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}
