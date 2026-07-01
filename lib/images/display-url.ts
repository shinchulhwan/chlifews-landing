/**
 * Supabase Storage 공개 URL에 cache busting 쿼리 추가
 * (동일 object path upsert 시 CDN/브라우저 캐시로 이전 이미지가 보이는 문제 방지)
 */
export function withImageCacheBust(
  url: string | null | undefined,
  version?: string | null,
): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (!version) {
    return trimmed;
  }

  const encoded = encodeURIComponent(version);
  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${encoded}`;
}

export function cacheBustFromUpdatedAt(updatedAt?: string | null): string | null {
  if (!updatedAt) return null;
  const ms = Date.parse(updatedAt);
  return Number.isFinite(ms) ? String(ms) : updatedAt;
}
