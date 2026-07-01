/**
 * Production admin API probe
 * npx tsx scripts/probe-production-admin-api.ts
 */
const BASE = process.env.PRODUCTION_URL ?? "https://chlifews-landing.vercel.app";

async function probe(
  label: string,
  init: RequestInit,
): Promise<void> {
  const response = await fetch(`${BASE}/api/admin/project-content`, init);
  const text = await response.text();
  console.log(`\n=== ${label} ===`);
  console.log("status:", response.status);
  console.log("content-type:", response.headers.get("content-type"));
  console.log("body (first 500):", text.slice(0, 500));
}

async function main(): Promise<void> {
  console.log("BASE:", BASE);

  await probe("no auth JSON", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "premium-reorder", orderedIds: [] }),
  });

  const cookie = "admin_session=authenticated";

  await probe("with cookie JSON", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ operation: "premium-reorder", orderedIds: [] }),
  });

  const form = new FormData();
  form.set("operation", "overview");
  form.set("section_title", "probe");
  form.set("description", "probe text");
  form.set("info_cards", "[]");

  await probe("with cookie multipart no image", {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
