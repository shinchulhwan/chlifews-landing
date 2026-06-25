/**
 * customers SELECT 테스트
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../lib/supabase";
import { tryCreateServiceRoleClient } from "../lib/supabase/admin";
import { isSupabaseAdminConfigured } from "../lib/supabase/env";

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

  console.log("env NEXT_PUBLIC_SUPABASE_URL:", url ? "set" : "missing");
  console.log("env NEXT_PUBLIC_SUPABASE_ANON_KEY:", anonKey ? "set" : "missing");
  console.log("env SUPABASE_SERVICE_ROLE_KEY:", isSupabaseAdminConfigured() ? "set" : "missing");

  const anon = createSupabaseClient();
  const { data: anonData, error: anonError } = await anon
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (anonError) {
    console.log("anon SELECT error:", anonError.message);
    console.log("code:", anonError.code);
    console.log("details:", anonError.details);
    console.log("hint:", anonError.hint);
  } else {
    console.log("anon SELECT ok, rows:", anonData?.length ?? 0);
  }

  const service = tryCreateServiceRoleClient();
  if (service) {
    const { data, error } = await service
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log("service SELECT error:", error.message);
      console.log("code:", error.code);
    } else {
      console.log("service SELECT ok, rows:", data?.length ?? 0);
    }
  }
}

main().catch(console.error);
