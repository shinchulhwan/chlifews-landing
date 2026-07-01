import { normalizeVerificationCode } from "@/lib/seo/verification";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings/defaults";
import {
  SEO_META_SETTING_KEYS,
  SITE_SETTING_KEYS,
} from "@/lib/site-settings/keys";
import { getSiteSettingsMap } from "@/lib/storage/site-settings";
import { parseSeoKeywords } from "@/lib/site-settings/load";

export type SeoMetaBundle = {
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  robots: "index" | "noindex";
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
  googleVerification: string;
  naverVerification: string;
  bingVerification: string;
  ga4Id: string;
  gtmId: string;
  metaPixel: string;
  favicon: string;
  appleIcon: string;
  values: Record<string, string>;
};

function pick(map: Record<string, string>, key: string): string {
  const value = map[key]?.trim();
  if (value) return value;
  return SITE_SETTINGS_DEFAULTS[key] ?? "";
}

function firstNonEmpty(...candidates: string[]): string {
  for (const c of candidates) {
    const v = c.trim();
    if (v) return v;
  }
  return "";
}

export function mergeSeoMetaSettings(
  stored: Record<string, string>,
): SeoMetaBundle {
  const map: Record<string, string> = { ...SITE_SETTINGS_DEFAULTS, ...stored };

  const metaTitle = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.META_TITLE),
    pick(map, SITE_SETTING_KEYS.SEO_TITLE),
    pick(map, SITE_SETTING_KEYS.BROWSER_TITLE),
  );
  const metaDescription = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.META_DESCRIPTION),
    pick(map, SITE_SETTING_KEYS.SEO_DESCRIPTION),
    pick(map, SITE_SETTING_KEYS.MAIN_DESCRIPTION),
  );
  const metaKeywords = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.META_KEYWORDS),
    pick(map, SITE_SETTING_KEYS.SEO_KEYWORDS),
  );
  const ogTitle = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.OG_TITLE),
    metaTitle,
  );
  const ogDescription = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.OG_DESCRIPTION),
    metaDescription,
  );
  const ogImage = pick(map, SITE_SETTING_KEYS.OG_IMAGE);
  const twitterTitle = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.TWITTER_TITLE),
    ogTitle,
  );
  const twitterDescription = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.TWITTER_DESCRIPTION),
    ogDescription,
  );
  const twitterImage = firstNonEmpty(
    pick(map, SITE_SETTING_KEYS.TWITTER_IMAGE),
    ogImage,
  );

  return {
    siteName: pick(map, SITE_SETTING_KEYS.SITE_NAME),
    metaTitle,
    metaDescription,
    metaKeywords,
    canonicalUrl: pick(map, SITE_SETTING_KEYS.CANONICAL_URL),
    robots: pick(map, SITE_SETTING_KEYS.ROBOTS) === "noindex" ? "noindex" : "index",
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl: pick(map, SITE_SETTING_KEYS.OG_URL),
    ogType: pick(map, SITE_SETTING_KEYS.OG_TYPE) || "website",
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard: pick(map, SITE_SETTING_KEYS.TWITTER_CARD) || "summary_large_image",
    googleVerification: normalizeVerificationCode(
      pick(map, SITE_SETTING_KEYS.GOOGLE_VERIFICATION),
    ),
    naverVerification: normalizeVerificationCode(
      pick(map, SITE_SETTING_KEYS.NAVER_VERIFICATION),
    ),
    bingVerification: normalizeVerificationCode(
      pick(map, SITE_SETTING_KEYS.BING_VERIFICATION),
    ),
    ga4Id: pick(map, SITE_SETTING_KEYS.GA4_ID),
    gtmId: pick(map, SITE_SETTING_KEYS.GTM_ID),
    metaPixel: pick(map, SITE_SETTING_KEYS.META_PIXEL),
    favicon: pick(map, SITE_SETTING_KEYS.FAVICON),
    appleIcon: pick(map, SITE_SETTING_KEYS.APPLE_ICON),
    values: map,
  };
}

export async function loadSeoMetaSettings(): Promise<SeoMetaBundle> {
  const stored = await getSiteSettingsMap([...SEO_META_SETTING_KEYS]);
  return mergeSeoMetaSettings(stored);
}

export { parseSeoKeywords };
