/**
 * project_community 저장 흐름 probe
 * 실행: npx tsx scripts/test-community-save.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteName = process.env.SITE_NAME?.trim() ?? "";

  console.log("=== project_community save probe ===\n");
  console.log("Site name:", siteName || "(not set)");

  if (!url || !serviceKey) {
    console.error("❌ Supabase env missing");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const { error: tableError } = await supabase
    .from("project_community")
    .select("id")
    .limit(1);

  if (tableError) {
    console.error("❌ Table check failed:", tableError.message);
    process.exit(1);
  }
  console.log("✅ project_community table exists");

  const testId = crypto.randomUUID();
  const { data, error } = await supabase
    .from("project_community")
    .insert({
      id: testId,
      site_name: siteName,
      sort_order: 999,
      title: "__save_probe__",
      subtitle: "probe subtitle",
      description: "probe description",
      image_url: "https://example.com/probe.jpg",
    })
    .select("*")
    .single();

  if (error) {
    console.error("❌ INSERT failed:", error.message);
    console.error(error);
    process.exit(1);
  }

  console.log("✅ INSERT success:", data);

  const { data: rows, error: selectError } = await supabase
    .from("project_community")
    .select("*")
    .eq("site_name", siteName)
    .eq("id", testId);

  if (selectError) {
    console.error("❌ SELECT failed:", selectError.message);
  } else {
    console.log("✅ SELECT by site_name:", rows?.length, "row(s)");
  }

  await supabase.from("project_community").delete().eq("id", testId);
  console.log("✅ Cleanup done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
