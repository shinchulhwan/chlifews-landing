import "server-only";

import { getSmsEnv, isSolapiSmsConfigured, logSmsEnvMasked } from "@/lib/config/sms";
import { callSolapiSendApi } from "@/lib/services/sms/solapi-api";
import type { SmsSendParams, SmsSendResult } from "@/lib/services/sms/types";

/**
 * Solapi SMS 발송 (서버 전용)
 */
export async function sendSolapiSms(
  params: SmsSendParams,
): Promise<SmsSendResult> {
  logSmsEnvMasked();

  if (!isSolapiSmsConfigured()) {
    const result: SmsSendResult = {
      success: false,
      provider: "solapi",
      error: "Solapi SMS가 설정되지 않았습니다.",
    };

    console.log("===== SMS START =====");
    console.log("===== SMS FAIL =====");
    console.log(result.error);
    printJson("[Solapi Error Detail]", {
      hint: "SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, ADMIN_PHONE를 확인하세요.",
      result,
    });

    return result;
  }

  const { apiKey, apiSecret } = getSmsEnv();
  return callSolapiSendApi({ apiKey, apiSecret }, params);
}

function printJson(label: string, data: unknown): void {
  console.log(label);
  console.log(JSON.stringify(data, null, 2));
}
