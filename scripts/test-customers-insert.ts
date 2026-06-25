/**
 * customers 테이블 INSERT 테스트 (RLS·권한 확인)
 *
 * 실행: npx tsx scripts/test-customers-insert.ts
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
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.");
    process.exit(1);
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const row = {
    name: "INSERT테스트",
    phone: "010-0000-0000",
    memo: "test-customers-insert script",
  };

  console.log("1) INSERT only (권장 경로)");
  const insertOnly = await supabase.from("customers").insert(row);
  if (insertOnly.error) {
    console.error("   실패:", insertOnly.error.message);
    console.error("   code:", insertOnly.error.code);
    console.error("   details:", insertOnly.error.details);
    console.error("   hint:", insertOnly.error.hint);
  } else {
    console.log("   성공");
  }

  console.log("2) INSERT + SELECT (SELECT RLS 없으면 실패)");
  const insertSelect = await supabase
    .from("customers")
    .insert({
      name: "SELECT테스트",
      phone: "010-1111-1111",
      memo: "insert+select test",
    })
    .select()
    .single();

  if (insertSelect.error) {
    console.error("   실패:", insertSelect.error.message);
    console.error("   code:", insertSelect.error.code);
  } else {
    console.log("   성공, id:", insertSelect.data?.id);
  }

  console.log("3) RPC register_customer (003 마이그레이션 적용 후)");
  const rpc = await supabase.rpc("register_customer", {
    p_name: "RPC테스트",
    p_phone: "010-2222-2222",
    p_memo: "rpc test",
  });

  if (rpc.error) {
    console.error("   실패:", rpc.error.message);
    console.error("   code:", rpc.error.code);
  } else {
    console.log("   성공");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
