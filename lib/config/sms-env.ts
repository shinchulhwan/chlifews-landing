/**
 * SMS 환경 변수 (.env.local)
 * 서버·테스트 스크립트 공용 (API Key는 NEXT_PUBLIC 아님)
 */

function cleanEnvValue(value: string | undefined): string {
  const trimmed = (value ?? "").trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function getSmsEnv() {
  return {
    apiKey: cleanEnvValue(process.env.SOLAPI_API_KEY),
    apiSecret: cleanEnvValue(process.env.SOLAPI_API_SECRET),
    sender: cleanEnvValue(process.env.SOLAPI_SENDER),
    adminPhone: cleanEnvValue(process.env.ADMIN_PHONE),
  };
}

function maskCredential(value: string): string {
  if (!value) {
    return "(empty)";
  }

  return `${value.slice(0, 6)}****`;
}

/** getSmsEnv() 값을 마스킹하여 터미널에 출력 */
export function logSmsEnvMasked(): void {
  const { apiKey, apiSecret, sender, adminPhone } = getSmsEnv();

  console.log("----- SMS ENV -----");
  console.log(`API_KEY : ${maskCredential(apiKey)}`);
  console.log(`API_SECRET : ${maskCredential(apiSecret)}`);
  console.log(`SENDER : ${sender || "(empty)"}`);
  console.log(`ADMIN_PHONE : ${adminPhone || "(empty)"}`);
  console.log("-------------------");
}

/** env 존재 여부 (값 노출 없이) */
export function logSmsEnvDiagnostic(context: string): void {
  const env = getSmsEnv();

  console.log(`[${context}] SMS env diagnostic`, {
    SOLAPI_API_KEY: Boolean(env.apiKey),
    SOLAPI_API_SECRET: Boolean(env.apiSecret),
    SOLAPI_SENDER: Boolean(env.sender),
    ADMIN_PHONE: Boolean(env.adminPhone),
    ADMIN_PHONE_value: env.adminPhone || "(empty)",
    configured: isSolapiSmsConfigured(),
  });
}

export function isSolapiSmsConfigured(): boolean {
  const { apiKey, apiSecret, sender, adminPhone } = getSmsEnv();
  return Boolean(apiKey && apiSecret && sender && adminPhone);
}
