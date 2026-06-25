/**
 * Supabase 연결 테스트
 *
 * 실행: npm run test:supabase
 * ( .env.local 환경 변수를 읽어 연결을 확인합니다 )
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const content = readFileSync(envPath, "utf-8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      process.env[key] = value;
    }
  } catch {
    console.error("❌ .env.local 파일을 찾을 수 없습니다.");
    process.exit(1);
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "❌ NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.",
    );
    process.exit(1);
  }

  console.log("🔍 Supabase 연결 테스트...");
  console.log(`   URL: ${url}`);

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error("❌ 연결 실패:", error.message);
    process.exit(1);
  }

  console.log("✅ Supabase 연결 성공");
}

main().catch((error) => {
  console.error("❌ 오류:", error);
  process.exit(1);
});
