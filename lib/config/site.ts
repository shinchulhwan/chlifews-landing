/**
 * 사이트(랜딩페이지) 식별명 — customers.site_name 저장용
 *
 * .env.local:
 * SITE_NAME=동암역 더트루엘 아파트 분양정보
 */
export function getSiteNameFromEnv(): string {
  return (process.env.SITE_NAME ?? "").trim();
}

export function getSiteNameForInsert(): string {
  const siteName = getSiteNameFromEnv();

  if (!siteName) {
    console.warn(
      "[site] SITE_NAME이 비어 있습니다. .env.local에 SITE_NAME을 설정하고 dev 서버를 재시작하세요.",
    );
  }

  return siteName;
}
