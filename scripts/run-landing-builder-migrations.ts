/**
 * Landing Builder v1 DB 마이그레이션 + 기본 프로젝트 시드
 *
 * 방법 1 (권장): SUPABASE_DB_PASSWORD 설정 후 실행
 *   SUPABASE_DB_PASSWORD=your_db_password npx tsx scripts/run-landing-builder-migrations.ts
 *
 * 방법 2: Supabase SQL Editor에서 supabase/RUN_LANDING_BUILDER_MIGRATIONS.sql 실행
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
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional
  }
}

function getDbConnectionString(): string | null {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) return null;

  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return null;

  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${ref}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT?.trim() || "5432";
  const user = process.env.SUPABASE_DB_USER?.trim() || "postgres";
  const database = process.env.SUPABASE_DB_NAME?.trim() || "postgres";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function runSqlFile(connectionString: string, relativePath: string): Promise<void> {
  const pg = await import("pg");
  const sql = readFileSync(resolve(process.cwd(), relativePath), "utf-8");
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`OK SQL: ${relativePath}`);
  } finally {
    await client.end();
  }
}

async function verifyWithServiceRole(): Promise<{
  hasProjects: boolean;
  hasSiteNameColumn: boolean;
  projectCount: number;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: projectsError } = await supabase.from("projects").select("id").limit(1);
  const hasProjects = !projectsError;

  const { error: settingsError } = await supabase
    .from("site_settings")
    .select("site_name")
    .limit(1);

  const hasSiteNameColumn = !settingsError;

  let projectCount = 0;
  if (hasProjects) {
    const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
    projectCount = count ?? 0;
  }

  return { hasProjects, hasSiteNameColumn, projectCount };
}

async function seedDefaultProject(): Promise<void> {
  const { ensureDefaultProjectSeeded } = await import("../lib/projects/storage");
  const project = await ensureDefaultProjectSeeded();
  if (project) {
    console.log("OK seed:", project.slug, project.site_name, `(default=${project.is_default})`);
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const seedOnly = process.argv.includes("--seed-only");

  console.log("=== Before migration ===");
  const before = await verifyWithServiceRole();
  console.log(before);

  if (before.hasProjects && before.hasSiteNameColumn && before.projectCount > 0) {
    console.log("Already migrated and seeded.");
    return;
  }

  if (seedOnly) {
    if (!before.hasProjects || !before.hasSiteNameColumn) {
      console.error("Tables missing. Run SQL in Supabase SQL Editor first:");
      console.error("  supabase/RUN_LANDING_BUILDER_MIGRATIONS.sql");
      process.exit(1);
    }
  } else {
    const connectionString = getDbConnectionString();

    if (connectionString) {
      console.log("\n=== Running SQL via postgres ===");
      if (!before.hasProjects || !before.hasSiteNameColumn) {
        await runSqlFile(connectionString, "supabase/RUN_LANDING_BUILDER_MIGRATIONS.sql");
      }
    } else if (!before.hasProjects || !before.hasSiteNameColumn) {
      console.error(`
DB 비밀번호가 없어 SQL을 자동 실행할 수 없습니다.

Supabase Dashboard → SQL Editor에서 다음 파일 전체 실행:
  supabase/RUN_LANDING_BUILDER_MIGRATIONS.sql

실행 후 시드만 돌리기:
  npm run migrate:landing-builder -- --seed-only
`);
      process.exit(1);
    }
  }

  console.log("\n=== Seeding default project ===");
  await seedDefaultProject();

  console.log("\n=== After migration ===");
  const after = await verifyWithServiceRole();
  console.log(after);

  if (!after.hasProjects || !after.hasSiteNameColumn) {
    process.exit(1);
  }

  console.log("\nMigration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
