/**
 * CMS 전체 CRUD probe (site_name 기준)
 * 실행: npx tsx scripts/test-cms-crud.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

  const siteName = process.env.SITE_NAME?.trim() ?? "";
  if (!siteName) {
    console.error("❌ SITE_NAME not set");
    process.exit(1);
  }

  const {
    upsertProjectOverview,
    getProjectOverview,
    upsertProjectLocation,
    getProjectLocation,
    insertProjectCommunityItem,
    updateProjectCommunityItem,
    deleteProjectCommunityItem,
    getProjectCommunity,
    insertProjectFloorplan,
    updateProjectFloorplan,
    deleteProjectFloorplan,
    getProjectFloorplans,
  } = await import("@/lib/storage/project-content");

  console.log("=== CMS CRUD test (site_name) ===\n");
  console.log("SITE_NAME:", siteName);

  const results: { op: string; ok: boolean; detail?: string }[] = [];

  try {
    await upsertProjectOverview({
      site_name: siteName,
      section_title: "__crud_test__",
      description: "overview probe",
      image_url: null,
      info_cards: [],
    });
    const overview = await getProjectOverview(siteName);
    results.push({
      op: "overview save/read",
      ok: overview?.section_title === "__crud_test__",
    });

    await upsertProjectLocation({
      site_name: siteName,
      section_title: "__crud_test__",
      main_image_url: null,
      points: [],
    });
    const location = await getProjectLocation(siteName);
    results.push({
      op: "location save/read",
      ok: location?.section_title === "__crud_test__",
    });

    await insertProjectCommunityItem(siteName, {
      sort_order: 0,
      title: "__crud_test__",
      subtitle: "sub",
      description: "desc",
      image_url: null,
    });
    const communityRows = await getProjectCommunity(siteName);
    const created = communityRows.find((r) => r.title === "__crud_test__");
    results.push({
      op: "community insert/read",
      ok: Boolean(created),
    });

    if (created) {
      await updateProjectCommunityItem(created.id, siteName, {
        subtitle: "updated",
      });
      const updated = (await getProjectCommunity(siteName)).find(
        (r) => r.id === created.id,
      );
      results.push({
        op: "community update",
        ok: updated?.subtitle === "updated",
      });
      await deleteProjectCommunityItem(created.id, siteName);
      const afterDelete = (await getProjectCommunity(siteName)).find(
        (r) => r.id === created.id,
      );
      results.push({ op: "community delete", ok: !afterDelete });
    }

    const floor = await insertProjectFloorplan(siteName, {
      sort_order: 0,
      type_name: "__crud_test__",
      supply_area: "1",
      exclusive_area: "1",
      description: "",
      image_url: null,
    });
    results.push({
      op: "floorplan insert",
      ok: floor.type_name === "__crud_test__",
    });

    await updateProjectFloorplan(floor.id, siteName, { type_name: "__updated__" });
    const floors = await getProjectFloorplans(siteName);
    results.push({
      op: "floorplan update",
      ok: floors.some((f) => f.id === floor.id && f.type_name === "__updated__"),
    });

    await deleteProjectFloorplan(floor.id, siteName);
    const afterFloorDelete = await getProjectFloorplans(siteName);
    results.push({
      op: "floorplan delete",
      ok: !afterFloorDelete.some((f) => f.id === floor.id),
    });

    // restore overview/location titles for admin (optional cleanup labels)
    await upsertProjectOverview({
      site_name: siteName,
      section_title: "사업개요",
      description: overview?.description ?? "",
      image_url: overview?.image_url ?? null,
      info_cards: overview?.info_cards ?? [],
    });
    await upsertProjectLocation({
      site_name: siteName,
      section_title: "입지환경",
      main_image_url: location?.main_image_url ?? null,
      points: location?.points ?? [],
    });
  } catch (error) {
    console.error("❌ CRUD test threw:", error);
    process.exit(1);
  }

  console.log("");
  let failed = 0;
  for (const r of results) {
    const mark = r.ok ? "✅" : "❌";
    console.log(`${mark} ${r.op}`);
    if (!r.ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`\n❌ ${failed} operation(s) failed`);
    process.exit(1);
  }
  console.log("\n✅ All CMS CRUD operations passed");
}

main();
