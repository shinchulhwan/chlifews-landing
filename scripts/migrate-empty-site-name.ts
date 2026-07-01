/**
 * site_name='' 로 저장된 CMS 데이터를 SITE_NAME 행으로 병합
 * npx tsx scripts/migrate-empty-site-name.ts
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
  const target = process.env.SITE_NAME?.trim();
  if (!target) {
    console.error("SITE_NAME required in .env.local");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("Target SITE_NAME:", target);

  const { data: emptyOverview } = await supabase
    .from("project_overview")
    .select("*")
    .eq("site_name", "")
    .maybeSingle();

  const { data: targetOverview } = await supabase
    .from("project_overview")
    .select("*")
    .eq("site_name", target)
    .maybeSingle();

  if (emptyOverview) {
    if (targetOverview) {
      const merged = {
        section_title: targetOverview.section_title || emptyOverview.section_title,
        description: targetOverview.description || emptyOverview.description,
        image_url: targetOverview.image_url || emptyOverview.image_url,
        info_cards:
          (targetOverview.info_cards as unknown[])?.length
            ? targetOverview.info_cards
            : emptyOverview.info_cards,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("project_overview")
        .update(merged)
        .eq("site_name", target);
      await supabase.from("project_overview").delete().eq("site_name", "");
      console.log("✅ project_overview merged into", target);
      console.log("   image_url:", merged.image_url);
    } else {
      await supabase
        .from("project_overview")
        .update({ site_name: target })
        .eq("site_name", "");
      console.log("✅ project_overview site_name updated to", target);
    }
  }

  const { data: emptyLocation } = await supabase
    .from("project_location")
    .select("*")
    .eq("site_name", "")
    .maybeSingle();

  const { data: targetLocation } = await supabase
    .from("project_location")
    .select("*")
    .eq("site_name", target)
    .maybeSingle();

  if (emptyLocation) {
    if (targetLocation) {
      const merged = {
        section_title: targetLocation.section_title || emptyLocation.section_title,
        main_image_url: targetLocation.main_image_url || emptyLocation.main_image_url,
        points:
          (targetLocation.points as unknown[])?.length
            ? targetLocation.points
            : emptyLocation.points,
        updated_at: new Date().toISOString(),
      };
      await supabase.from("project_location").update(merged).eq("site_name", target);
      await supabase.from("project_location").delete().eq("site_name", "");
      console.log("✅ project_location merged");
      console.log("   main_image_url:", merged.main_image_url);
    } else {
      await supabase
        .from("project_location")
        .update({ site_name: target })
        .eq("site_name", "");
      console.log("✅ project_location site_name updated");
    }
  }

  const { data: emptyPremium } = await supabase
    .from("project_premium")
    .select("id")
    .eq("site_name", "");

  if (emptyPremium?.length) {
    await supabase
      .from("project_premium")
      .update({ site_name: target, updated_at: new Date().toISOString() })
      .eq("site_name", "");
    console.log("✅ project_premium rows updated:", emptyPremium.length);
  }

  console.log("\nDone.");
}

main();
