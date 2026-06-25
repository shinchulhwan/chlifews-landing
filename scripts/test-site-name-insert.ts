/**
 * customers INSERT 시 site_name 저장 테스트
 * npm run test:site-name-insert
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSupabaseClient } from "../lib/supabase";

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

  const siteName = (process.env.SITE_NAME ?? "").trim();
  console.log("SITE_NAME from env:", siteName || "(empty)");

  if (!siteName) {
    console.error("SITE_NAME이 .env.local에 설정되지 않았습니다.");
    process.exitCode = 1;
    return;
  }

  const supabase = createSupabaseClient();

  const row = {
    name: "site_name테스트",
    phone: "010-8888-8888",
    memo: "site_name insert test",
    site_name: siteName,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert(row)
    .select("id, name, site_name")
    .single();

  if (error) {
    console.error("INSERT failed:", error.message, error.code);
    process.exitCode = 1;
    return;
  }

  console.log("INSERT ok:", data);

  const { data: verify } = await supabase
    .from("customers")
    .select("site_name")
    .eq("id", data.id)
    .single();

  console.log("VERIFY site_name:", verify?.site_name);
}

main().catch(console.error);
