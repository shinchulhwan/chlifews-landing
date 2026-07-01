/**
 * site_settings 저장 테스트
 * npx tsx scripts/test-site-settings-save.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { executeSaveSiteSettingsSection } from "@/lib/site-settings/save-site-settings";
import { SITE_SETTING_KEYS } from "@/lib/site-settings/keys";
import { getSiteSettingsMap } from "@/lib/storage/site-settings";

function loadEnvLocal(): void {
  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const formData = new FormData();
  formData.append(SITE_SETTING_KEYS.SEO_TITLE, "테스트 SEO Title");
  formData.append(SITE_SETTING_KEYS.SEO_DESCRIPTION, "테스트 SEO Description");
  formData.append(SITE_SETTING_KEYS.ROBOTS, "index");

  const result = await executeSaveSiteSettingsSection("seo", formData);
  console.log("Save result:", result);

  const stored = await getSiteSettingsMap([SITE_SETTING_KEYS.SEO_TITLE]);
  console.log("DB seo_title:", stored[SITE_SETTING_KEYS.SEO_TITLE]);

  if (!result.success) {
    process.exit(1);
  }
  console.log("✅ site_settings save OK");
}

main();
