/**
 * 사이트별 독립 SEO 설정
 * site_settings 키와 1:1 매핑
 */
export type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  canonicalUrl: string;
  robots: "index" | "noindex";
  sitemapAutoGenerate: boolean;
  robotsAutoGenerate: boolean;
  googleVerification: string;
  naverVerification: string;
  bingVerification: string;
};

export type PartialSeoConfig = Partial<SeoConfig>;
