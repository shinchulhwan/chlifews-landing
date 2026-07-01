import { parseSeoKeywords } from "@/lib/seo-meta/load";

export type SeoInspectionResult = {
  score: number;
  titleLength: number;
  descriptionLength: number;
  keywordsCount: number;
  hasOgImage: boolean;
  hasCanonical: boolean;
  hasRobots: boolean;
  checks: { label: string; ok: boolean; detail: string }[];
};

export function inspectSeoMeta(values: {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
}): SeoInspectionResult {
  const titleLength = values.metaTitle.trim().length;
  const descriptionLength = values.metaDescription.trim().length;
  const keywordsCount = parseSeoKeywords(values.metaKeywords).length;
  const hasOgImage = Boolean(values.ogImage.trim());
  const hasCanonical = Boolean(values.canonicalUrl.trim());
  const hasRobots = Boolean(values.robots.trim());

  const titleOk = titleLength >= 30 && titleLength <= 60;
  const descriptionOk = descriptionLength >= 70 && descriptionLength <= 160;
  const keywordsOk = keywordsCount >= 1;

  const checks = [
    {
      label: "Title 길이",
      ok: titleOk,
      detail: `${titleLength}자 (권장 30~60자)`,
    },
    {
      label: "Description 길이",
      ok: descriptionOk,
      detail: `${descriptionLength}자 (권장 70~160자)`,
    },
    {
      label: "Keywords 개수",
      ok: keywordsOk,
      detail: `${keywordsCount}개`,
    },
    {
      label: "OG Image 등록",
      ok: hasOgImage,
      detail: hasOgImage ? "등록됨" : "미등록",
    },
    {
      label: "Canonical 설정",
      ok: hasCanonical,
      detail: hasCanonical ? "설정됨" : "미설정",
    },
    {
      label: "Robots 설정",
      ok: hasRobots,
      detail: hasRobots ? values.robots : "미설정",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    titleLength,
    descriptionLength,
    keywordsCount,
    hasOgImage,
    hasCanonical,
    hasRobots,
    checks,
  };
}
