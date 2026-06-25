/**
 * SMS 환경 변수 (.env.local)
 * 서버·테스트 스크립트 공용 (API Key는 NEXT_PUBLIC 아님)
 */
export function getSmsEnv() {
  return {
    apiKey: process.env.SOLAPI_API_KEY ?? "",
    apiSecret: process.env.SOLAPI_API_SECRET ?? "",
    sender: process.env.SOLAPI_SENDER ?? "",
    adminPhone: process.env.ADMIN_PHONE ?? "",
  };
}

function maskCredential(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "(empty)";
  }

  return `${trimmed.slice(0, 6)}****`;
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

export function isSolapiSmsConfigured(): boolean {
  const { apiKey, apiSecret, sender, adminPhone } = getSmsEnv();
  return Boolean(apiKey && apiSecret && sender && adminPhone);
}
