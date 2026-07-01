/**
 * CMS 콘텐츠 site_name 진단
 * 실행: npx tsx scripts/diagnose-cms-content.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const envSiteName = (process.env.SITE_NAME ?? "").trim();

  if (!url || !key) {
    console.error("Supabase env missing");
    process.exit(1);
  }

  console.log("=== CMS site_name 진단 ===\n");
  console.log(".env.local SITE_NAME:", envSiteName || "(empty)");

  const supabase = createClient(url, key);

  for (const table of ["project_overview", "project_location"] as const) {
    const { data, error } = await supabase
      .from(table)
      .select("id, site_name, section_title, updated_at")
      .order("updated_at", { ascending: false });

    console.log(`\n--- ${table} ---`);
    if (error) {
      console.log("ERROR:", error.message);
      continue;
    }

    if (!data?.length) {
      console.log("DB에 행 없음");
      continue;
    }

    for (const row of data) {
      const match = row.site_name === envSiteName;
      const descPreview =
        table === "project_overview"
          ? String((row as { description?: string }).description ?? "").slice(0, 40)
          : undefined;
      console.log({
        id: row.id,
        site_name: row.site_name,
        section_title: row.section_title,
        ...(descPreview !== undefined ? { description_preview: descPreview } : {}),
        matches_env: match,
        updated_at: row.updated_at,
      });
    }

    const matched = data.filter((r) => r.site_name === envSiteName);
    console.log(
      `→ env와 일치하는 행: ${matched.length} / 전체 ${data.length}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
