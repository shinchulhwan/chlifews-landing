/**
 * 검색엔진 소유확인 코드 정규화.
 * 관리자가 전체 <meta> 태그를 붙여넣어도 content 값만 추출합니다.
 */
export function normalizeVerificationCode(raw: string): string {
  let value = raw.trim();
  if (!value) return "";

  for (let i = 0; i < 3; i++) {
    if (!value.includes("<meta") || !/content\s*=/i.test(value)) {
      break;
    }
    const match = value.match(/content\s*=\s*["']([^"']+)["']/i);
    if (!match?.[1]) break;
    value = match[1].trim();
  }

  return value;
}

export type VerificationMetaTag = {
  name: string;
  content: string;
};

export function getVerificationMetaTags(settings: {
  googleVerification: string;
  naverVerification: string;
  bingVerification: string;
}): VerificationMetaTag[] {
  const tags: VerificationMetaTag[] = [];

  const google = normalizeVerificationCode(settings.googleVerification);
  if (google) {
    tags.push({ name: "google-site-verification", content: google });
  }

  const naver = normalizeVerificationCode(settings.naverVerification);
  if (naver) {
    tags.push({ name: "naver-site-verification", content: naver });
  }

  const bing = normalizeVerificationCode(settings.bingVerification);
  if (bing) {
    tags.push({ name: "msvalidate.01", content: bing });
  }

  return tags;
}
