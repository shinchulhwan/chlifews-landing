/**
 * Solapi SMS 실제 API 호출 테스트
 *
 * 실행: npm run test:solapi-sms
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatNewCustomerSmsMessage } from "../lib/services/sms/message";
import { callSolapiSendApi } from "../lib/services/sms/solapi-api";

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

  const apiKey = process.env.SOLAPI_API_KEY ?? "";
  const apiSecret = process.env.SOLAPI_API_SECRET ?? "";
  const sender = process.env.SOLAPI_SENDER ?? "";
  const adminPhone = process.env.ADMIN_PHONE ?? "";

  const configured = Boolean(apiKey && apiSecret && sender && adminPhone);
  console.log("Solapi SMS 설정:", configured ? "ok" : "missing env");

  if (!configured) {
    console.log("테스트 완료: SMS send result: fail");
    console.log(
      "error: SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, ADMIN_PHONE가 필요합니다.",
    );
    process.exitCode = 1;
    return;
  }

  const text = formatNewCustomerSmsMessage({
    name: "SMS테스트",
    phone: "010-0000-0000",
    memo: "Solapi API 호출 테스트",
    created_at: "2026.06.26 12:00",
  });

  const result = await callSolapiSendApi(
    { apiKey, apiSecret },
    { to: adminPhone, from: sender, text },
  );

  if (result.success) {
    console.log("테스트 완료: SMS send result: success");
    console.log("messageId:", result.messageId ?? "(none)");
  } else {
    console.log("테스트 완료: SMS send result: fail");
    console.log("error:", result.error ?? "알 수 없는 오류");
    if (result.response) {
      console.log("response:", JSON.stringify(result.response, null, 2));
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.log("테스트 완료: SMS send result: fail");
  console.log(
    "error:",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
