/**
 * Vercel Production 환경 변수·API 상태 점검
 * npx tsx scripts/check-production-env.ts
 */
const BASE = process.env.PRODUCTION_URL ?? "https://chlifews-landing.vercel.app";
const cookie = "admin_session=authenticated";

async function main(): Promise<void> {
  console.log("Production URL:", BASE);
  console.log("");

  const supabase = await fetch(`${BASE}/api/supabase/test`);
  const supabaseText = await supabase.text();
  console.log("Supabase test:", supabase.status, supabaseText);

  const form = new FormData();
  form.set("operation", "overview");
  form.set("section_title", "env-check");
  form.set("description", "x");
  form.set("info_cards", "[]");

  const save = await fetch(`${BASE}/api/admin/project-content`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const saveText = await save.text();
  console.log("\nAdmin save (no image):", save.status, save.headers.get("content-type"));
  console.log(saveText.slice(0, 600));

  try {
    const parsed = JSON.parse(saveText) as {
      data?: { site_name?: string };
      message?: string;
    };
    const siteName = parsed.data?.site_name ?? "";
    console.log("\n=== 환경 변수 추정 ===");
    console.log(
      "SITE_NAME:",
      siteName ? `설정됨 (${siteName})` : "❌ 미설정 (site_name이 빈 문자열로 저장됨)",
    );
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      save.status === 200 && parsed.data ? "✅ 설정됨 (저장 성공)" : "확인 필요",
    );
    console.log(
      "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY:",
      supabase.status === 200 ? "✅ 설정됨" : "❌ 확인 필요",
    );
  } catch {
    console.log("응답 JSON 파싱 실패 — 본문을 위에 출력했습니다.");
  }

  console.log("\nVercel Dashboard에서 직접 확인 필요:");
  console.log("- SITE_NAME");
  console.log("- SITE_STORAGE_SLUG");
  console.log("- SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER / ADMIN_PHONE (SMS용)");
}

main();
