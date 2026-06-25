export const ALL_SITES_TAB = "__all__";
export const EMPTY_SITE_TAB = "__empty__";

export function normalizeSiteTabKey(siteName: string | null | undefined): string {
  const trimmed = (siteName ?? "").trim();
  return trimmed || EMPTY_SITE_TAB;
}

export function displaySiteTabLabel(siteKey: string): string {
  if (siteKey === ALL_SITES_TAB) return "전체";
  if (siteKey === EMPTY_SITE_TAB) return "(미지정)";
  return siteKey;
}
