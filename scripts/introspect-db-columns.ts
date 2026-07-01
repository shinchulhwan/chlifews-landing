/**
 * Supabase 실제 컬럼 introspect
 * 실행: npx tsx scripts/introspect-db-columns.ts
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

const CMS_TABLES = [
  "site_settings",
  "project_overview",
  "project_premium",
  "project_location",
  "project_gallery",
  "project_floorplans",
  "project_community",
] as const;

async function main(): Promise<void> {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Supabase env missing");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  for (const table of CMS_TABLES) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`${table}: ERROR ${error.message}`);
      continue;
    }
    const cols = data?.[0] ? Object.keys(data[0]) : "(empty table)";
    console.log(`${table}: ${Array.isArray(cols) ? cols.join(", ") : cols}`);
  }
}

main();
