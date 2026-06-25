import {
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_NAME,
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo/site";

type JsonLdProps = {
  path?: string;
};

export default function StructuredData({ path = "/" }: JsonLdProps) {
  const pageUrl = new URL(path, SITE_URL).toString();
  const logoUrl = new URL(ORGANIZATION_LOGO_PATH, SITE_URL).toString();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: logoUrl,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_BRAND,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_BRAND,
      url: SITE_URL,
    },
    inLanguage: "ko-KR",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: SITE_URL,
      },
    ],
  };

  const jsonLd = [organization, website, webPage, breadcrumb];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
