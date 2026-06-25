/**
 * SMS 환경 변수 읽기 테스트
 *
 * 실행: npm run test:sms-env
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { logSmsEnvMasked, isSolapiSmsConfigured } from "../lib/config/sms-env";

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

loadEnvLocal();
logSmsEnvMasked();
console.log("configured:", isSolapiSmsConfigured() ? "ok" : "missing");
