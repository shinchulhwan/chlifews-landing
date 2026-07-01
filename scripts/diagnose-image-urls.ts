/**
 * DB image_url vs Storage 실측
 * npx tsx scripts/diagnose-image-urls.ts
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

async function headOk(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return `${res.status} ${res.headers.get("content-type") ?? ""}`;
  } catch (e) {
    return `ERR ${e instanceof Error ? e.message : e}`;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const siteName = process.env.SITE_NAME?.trim() ?? "";
  const supabase = createClient(url, key);

  console.log("SITE_NAME (local env):", siteName || "(empty)");
  console.log("");

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "hero_background");
  console.log("=== site_settings hero_background ===");
  for (const row of settings ?? []) {
    console.log(row);
    if (row.value) console.log("  HEAD:", await headOk(row.value));
  }

  const { data: overviews } = await supabase.from("project_overview").select("*");
  console.log("\n=== project_overview (all site_name) ===");
  for (const row of overviews ?? []) {
    console.log({
      site_name: row.site_name,
      section_title: row.section_title,
      image_url: row.image_url,
      updated_at: row.updated_at,
      matches_env: row.site_name === siteName,
    });
    if (row.image_url) console.log("  HEAD:", await headOk(row.image_url));
  }

  const { data: locations } = await supabase.from("project_location").select("*");
  console.log("\n=== project_location ===");
  for (const row of locations ?? []) {
    console.log({
      site_name: row.site_name,
      main_image_url: row.main_image_url,
      matches_env: row.site_name === siteName,
    });
    if (row.main_image_url) console.log("  HEAD:", await headOk(row.main_image_url));
  }

  const { data: gallery } = await supabase
    .from("project_gallery")
    .select("id,site_name,image_url,title,updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  console.log("\n=== project_gallery (latest 5) ===");
  for (const row of gallery ?? []) {
    console.log(row);
    if (row.image_url) console.log("  HEAD:", await headOk(row.image_url));
  }

  const { data: community } = await supabase
    .from("project_community")
    .select("id,site_name,image_url,title,updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  console.log("\n=== project_community (latest 5) ===");
  for (const row of community ?? []) {
    console.log(row);
    if (row.image_url) console.log("  HEAD:", await headOk(row.image_url));
  }

  // Production API
  const prod = "https://chlifews-landing.vercel.app";
  const overviewApi = await fetch(`${prod}/api/project-content/overview`);
  const overviewJson = await overviewApi.json();
  console.log("\n=== Production API /api/project-content/overview ===");
  console.log(JSON.stringify(overviewJson, null, 2));

  const heroPage = await fetch(prod);
  const html = await heroPage.text();
  const supabaseUrls = [...html.matchAll(/https:\/\/[^"']+supabase\.co\/storage[^"']+/g)].map(
    (m) => m[0],
  );
  const localImages = [...html.matchAll(/\/images\/[^"']+/g)].map((m) => m[0]);
  console.log("\n=== Production landing HTML image refs ===");
  console.log("supabase storage URLs:", [...new Set(supabaseUrls)]);
  console.log("local /images paths:", [...new Set(localImages)]);
}

main();
