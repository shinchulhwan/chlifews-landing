/**
 * SEO 메타 필드 저장 API 스모크 테스트
 * npx tsx scripts/test-seo-meta-save.ts
 */
import { loadSeoMetaSettings } from "../lib/seo-meta/load";
import { executeSaveSeoMetaField } from "../lib/seo-meta/save";
import { SITE_SETTING_KEYS } from "../lib/site-settings/keys";

async function main() {
  const before = await loadSeoMetaSettings();
  const testTitle = `[SEO-TEST] ${Date.now()}`;

  const formData = new FormData();
  formData.append("value", testTitle);

  const result = await executeSaveSeoMetaField(
    SITE_SETTING_KEYS.META_TITLE,
    formData,
  );

  if (!result.success) {
    console.error("FAIL save:", result.message);
    process.exit(1);
  }

  const after = await loadSeoMetaSettings();
  if (after.metaTitle !== testTitle) {
    console.error("FAIL reload:", { expected: testTitle, got: after.metaTitle });
    process.exit(1);
  }

  // restore previous value
  const restore = new FormData();
  restore.append("value", before.values[SITE_SETTING_KEYS.META_TITLE] ?? "");
  await executeSaveSeoMetaField(SITE_SETTING_KEYS.META_TITLE, restore);

  console.log("OK seo-meta save + reload");
  console.log("metaTitle sample:", testTitle);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
