import "server-only";

import {
  getSmsEnv,
  isSolapiSmsConfigured,
  logSmsEnvDiagnostic,
  logSmsEnvMasked,
} from "@/lib/config/sms-env";
import { callSolapiSendApi } from "@/lib/services/sms/solapi-api";
import type { SmsSendParams, SmsSendResult } from "@/lib/services/sms/types";

/**
 * Solapi SMS 발송 (서버 전용)
 * sendSMS() — 동일 함수 별칭
 */
export async function sendSMS(params: SmsSendParams): Promise<SmsSendResult> {
  logSmsEnvMasked();
  logSmsEnvDiagnostic("sendSMS");

  console.log("[sendSMS] called", {
    to: params.to || "(empty)",
    from: params.from || "(empty)",
    textLength: params.text?.length ?? 0,
  });

  if (!isSolapiSmsConfigured()) {
    const result: SmsSendResult = {
      success: false,
      provider: "solapi",
      error: "Solapi SMS가 설정되지 않았습니다.",
    };

    console.log("===== SMS START =====");
    console.log("===== SMS FAIL =====");
    console.log(result.error);
    console.log("[sendSMS] hint: SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, ADMIN_PHONE 확인");
    console.log("[sendSMS] result:", JSON.stringify(result, null, 2));

    return result;
  }

  const { apiKey, apiSecret } = getSmsEnv();
  const result = await callSolapiSendApi({ apiKey, apiSecret }, params);

  console.log("[sendSMS] result:", JSON.stringify(result, null, 2));
  return result;
}

export const sendSolapiSms = sendSMS;

function printJson(label: string, data: unknown): void {
  console.log(label);
  console.log(JSON.stringify(data, null, 2));
}

export { printJson };
