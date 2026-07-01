/**
 * Supabase CMS 테이블 존재/컬럼 검증 + 저장 API dry-run
 *
 * 실행: npm run test:db-schema
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

const EXPECTED_TABLES: Record<string, string[]> = {
  site_settings: ["key", "value", "updated_at"],
  project_overview: [
    "id",
    "site_name",
    "section_title",
    "description",
    "image_url",
    "info_cards",
    "updated_at",
  ],
  project_premium: [
    "id",
    "site_name",
    "record_kind",
    "sort_order",
    "title",
    "description",
    "image_url",
    "created_at",
    "updated_at",
  ],
  project_location: [
    "id",
    "site_name",
    "section_title",
    "main_image_url",
    "points",
    "updated_at",
  ],
  project_gallery: [
    "id",
    "site_name",
    "sort_order",
    "image_url",
    "title",
    "is_featured",
    "created_at",
    "updated_at",
  ],
  project_floorplans: [
    "id",
    "site_name",
    "sort_order",
    "type_name",
    "supply_area",
    "exclusive_area",
    "description",
    "image_url",
    "created_at",
    "updated_at",
  ],
  project_community: [
    "id",
    "site_name",
    "sort_order",
    "title",
    "subtitle",
    "description",
    "image_url",
    "created_at",
    "updated_at",
  ],
};

async function main(): Promise<void> {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey === "your_service_role_key") {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 미설정");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("=== 1. 테이블 존재 여부 ===\n");

  const tableResults: Record<
    string,
    { exists: boolean; columns: string[]; error?: string }
  > = {};

  for (const table of Object.keys(EXPECTED_TABLES)) {
    const { data, error } = await supabase.from(table).select("*").limit(0);

    if (error) {
      const missing = error.code === "PGRST205" || error.message.includes("schema cache");
      tableResults[table] = {
        exists: false,
        columns: [],
        error: missing ? "TABLE_NOT_FOUND" : error.message,
      };
      console.log(`❌ ${table}: 없음 (${error.code ?? "error"}) — ${error.message}`);
    } else {
      // PostgREST returns empty array; infer columns via insert dry-run below
      tableResults[table] = { exists: true, columns: [] };
      console.log(`✅ ${table}: 존재`);
    }
  }

  console.log("\n=== 2. 컬럼 구조 (service role SELECT 1행) ===\n");

  for (const [table, expectedCols] of Object.entries(EXPECTED_TABLES)) {
    if (!tableResults[table]?.exists) {
      console.log(`⏭ ${table}: 테이블 없음 — 컬럼 검사 생략`);
      continue;
    }

    const { data, error } = await supabase.from(table).select("*").limit(1);

    if (error) {
      console.log(`❌ ${table}: 컬럼 조회 실패 — ${error.message}`);
      continue;
    }

    const row = data?.[0];
    const actualCols = row ? Object.keys(row) : [];

    if (actualCols.length === 0) {
      // empty table: probe with expected minimal insert then rollback via delete
      console.log(`ℹ ${table}: 데이터 없음 — INSERT probe로 컬럼 검증`);
    } else {
      tableResults[table].columns = actualCols;
      const missing = expectedCols.filter((c) => !actualCols.includes(c));
      const extra = actualCols.filter((c) => !expectedCols.includes(c));

      if (missing.length === 0) {
        console.log(`✅ ${table}: 컬럼 일치 (${actualCols.join(", ")})`);
      } else {
        console.log(`⚠ ${table}: 컬럼 불일치`);
        console.log(`   기대: ${expectedCols.join(", ")}`);
        console.log(`   실제: ${actualCols.join(", ")}`);
        console.log(`   누락: ${missing.join(", ") || "(없음)"}`);
        console.log(`   추가: ${extra.join(", ") || "(없음)"}`);
      }
    }
  }

  console.log("\n=== 3. 저장 API dry-run (INSERT → DELETE) ===\n");

  /** 실제 SITE_NAME 데이터를 덮어쓰지 않도록 probe 전용 식별자 사용 */
  const PROBE_SITE_NAME = "__db_schema_probe__";
  const siteName = (process.env.SITE_NAME ?? "").trim() || "db-schema-test";
  const probeId = crypto.randomUUID();

  async function probeOverview() {
    const payload = {
      site_name: PROBE_SITE_NAME,
      section_title: "__probe__",
      description: "probe",
      image_url: null,
      info_cards: [],
    };
    const { data, error } = await supabase
      .from("project_overview")
      .upsert(payload, { onConflict: "site_name" })
      .select("id")
      .single();

    if (error) return { ok: false, op: "UPSERT project_overview", error: error.message };

    await supabase
      .from("project_overview")
      .delete()
      .eq("site_name", PROBE_SITE_NAME);
    return { ok: true, op: "UPSERT project_overview", id: data?.id };
  }

  async function probePremium() {
    const { data, error } = await supabase
      .from("project_premium")
      .insert({
        id: probeId,
        site_name: PROBE_SITE_NAME,
        record_kind: "section",
        sort_order: -1,
        title: "__probe__",
        description: "",
      })
      .select("id")
      .single();

    if (error) return { ok: false, op: "INSERT project_premium", error: error.message };

    await supabase
      .from("project_premium")
      .delete()
      .eq("id", probeId)
      .eq("site_name", PROBE_SITE_NAME);
    return { ok: true, op: "INSERT project_premium", id: data?.id };
  }

  async function probeLocation() {
    const { data, error } = await supabase
      .from("project_location")
      .upsert(
        {
          site_name: PROBE_SITE_NAME,
          section_title: "__probe__",
          main_image_url: null,
          points: [],
        },
        { onConflict: "site_name" },
      )
      .select("id")
      .single();

    if (error) return { ok: false, op: "UPSERT project_location", error: error.message };

    await supabase
      .from("project_location")
      .delete()
      .eq("site_name", PROBE_SITE_NAME);
    return { ok: true, op: "UPSERT project_location", id: data?.id };
  }

  async function probeGallery() {
    const gid = crypto.randomUUID();
    const { data, error } = await supabase
      .from("project_gallery")
      .insert({
        id: gid,
        site_name: siteName,
        sort_order: 0,
        image_url: "https://example.com/probe.jpg",
        title: "__probe__",
        is_featured: false,
      })
      .select("id")
      .single();

    if (error) return { ok: false, op: "INSERT project_gallery", error: error.message };

    await supabase.from("project_gallery").delete().eq("id", gid);
    return { ok: true, op: "INSERT project_gallery", id: data?.id };
  }

  async function probeFloorplan() {
    const fid = crypto.randomUUID();
    const { data, error } = await supabase
      .from("project_floorplans")
      .insert({
        id: fid,
        site_name: siteName,
        sort_order: 0,
        type_name: "__probe__",
        supply_area: "",
        exclusive_area: "",
        description: "",
        image_url: null,
      })
      .select("id")
      .single();

    if (error) return { ok: false, op: "INSERT project_floorplans", error: error.message };

    await supabase.from("project_floorplans").delete().eq("id", fid);
    return { ok: true, op: "INSERT project_floorplans", id: data?.id };
  }

  async function probeCommunity() {
    const cid = crypto.randomUUID();
    const { data, error } = await supabase
      .from("project_community")
      .insert({
        id: cid,
        site_name: siteName,
        sort_order: 0,
        title: "__probe__",
        subtitle: "",
        description: "",
        image_url: null,
      })
      .select("id")
      .single();

    if (error) return { ok: false, op: "INSERT project_community", error: error.message };

    await supabase.from("project_community").delete().eq("id", cid);
    return { ok: true, op: "INSERT project_community", id: data?.id };
  }

  async function probeSiteSettings() {
    const { error: upsertError } = await supabase.from("site_settings").upsert(
      {
        key: "__probe_hero__",
        value: "probe",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (upsertError) {
      return { ok: false, op: "UPSERT site_settings", error: upsertError.message };
    }

    await supabase.from("site_settings").delete().eq("key", "__probe_hero__");
    return { ok: true, op: "UPSERT site_settings" };
  }

  const probes = [
    probeSiteSettings,
    probeOverview,
    probePremium,
    probeLocation,
    probeGallery,
    probeCommunity,
    probeFloorplan,
  ];

  for (const probe of probes) {
    if (!tableResults[Object.keys(EXPECTED_TABLES)[probes.indexOf(probe)]]?.exists &&
        probes.indexOf(probe) > 0) {
      // skip if table missing - handled per probe
    }
    const result = await probe();
    if (result.ok) {
      console.log(`✅ ${result.op}: SQL 실행 성공`);
    } else {
      console.log(`❌ ${result.op}: ${result.error}`);
    }
  }

  console.log("\n=== 4. 마이그레이션 실행 순서 (테이블 없을 때) ===");
  console.log("1. supabase/migrations/008_site_settings.sql");
  console.log("2. supabase/migrations/009_project_content.sql");
  console.log("3. supabase/migrations/010_project_community.sql");
  console.log("   → Supabase Dashboard → SQL Editor에서 순서대로 실행\n");

  const missingTables = Object.entries(tableResults)
    .filter(([, v]) => !v.exists)
    .map(([k]) => k);

  if (missingTables.length > 0) {
    console.log(`⚠ 누락 테이블: ${missingTables.join(", ")}`);
    process.exit(1);
  }

  console.log("✅ 모든 CMS 테이블이 존재합니다.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
