import { createHmac, randomBytes } from "node:crypto";
import type { SmsSendParams, SmsSendResult } from "@/lib/services/sms/types";

const SOLAPI_SEND_URL = "https://api.solapi.com/messages/v4/send";

export type SolapiCredentials = {
  apiKey: string;
  apiSecret: string;
};

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function createSolapiAuthorizationHeader(
  apiKey: string,
  apiSecret: string,
): string {
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

function printJson(label: string, data: unknown): void {
  console.log(label);
  console.log(JSON.stringify(data, null, 2));
}

function logSmsStart(requestBody: Record<string, unknown>): void {
  console.log("===== SMS START =====");
  printJson("[Solapi Request]", {
    url: SOLAPI_SEND_URL,
    method: "POST",
    body: requestBody,
  });
}

function logSmsSuccess(result: SmsSendResult): void {
  console.log("===== SMS SUCCESS =====");
  console.log(result);
  printJson("[Solapi Response]", result.response ?? {});
}

function logSmsFail(error: unknown, extra?: Record<string, unknown>): void {
  console.log("===== SMS FAIL =====");
  console.log(error);
  if (extra) {
    printJson("[Solapi Error Detail]", extra);
  }
}

/**
 * Solapi SMS 발송 (공식 REST API)
 * @see https://docs.solapi.com/
 */
export async function callSolapiSendApi(
  credentials: SolapiCredentials,
  params: SmsSendParams,
): Promise<SmsSendResult> {
  const to = normalizePhoneNumber(params.to);
  const from = normalizePhoneNumber(params.from);
  const text = params.text.trim();

  const requestBody = {
    message: {
      to,
      from,
      text,
    },
  };

  if (!to || !from || !text) {
    const result: SmsSendResult = {
      success: false,
      provider: "solapi",
      error: "수신번호, 발신번호, 또는 메시지가 올바르지 않습니다.",
    };
    logSmsStart(requestBody);
    logSmsFail(result.error, { result });
    return result;
  }

  const { apiKey, apiSecret } = credentials;

  if (!apiKey || !apiSecret) {
    const result: SmsSendResult = {
      success: false,
      provider: "solapi",
      error: "Solapi API Key 또는 Secret이 설정되지 않았습니다.",
    };
    logSmsStart(requestBody);
    logSmsFail(result.error, { result });
    return result;
  }

  logSmsStart(requestBody);

  try {
    const response = await fetch(SOLAPI_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createSolapiAuthorizationHeader(apiKey, apiSecret),
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let responseData: Record<string, unknown> = {};

    try {
      responseData = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      const errorMessage =
        (typeof responseData.errorMessage === "string" &&
          responseData.errorMessage) ||
        (typeof responseData.message === "string" && responseData.message) ||
        responseText ||
        `Solapi API 오류 (${response.status})`;

      const result: SmsSendResult = {
        success: false,
        provider: "solapi",
        error: errorMessage,
        status: response.status,
        response: responseData,
      };

      logSmsFail(errorMessage, {
        status: response.status,
        result,
        response: responseData,
      });
      return result;
    }

    const messageId =
      (typeof responseData.messageId === "string" && responseData.messageId) ||
      (typeof responseData.groupId === "string" && responseData.groupId) ||
      undefined;

    const result: SmsSendResult = {
      success: true,
      provider: "solapi",
      messageId,
      status: response.status,
      response: responseData,
    };

    logSmsSuccess(result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Solapi SMS 발송 실패";

    const result: SmsSendResult = {
      success: false,
      provider: "solapi",
      error: errorMessage,
    };

    logSmsFail(errorMessage, {
      result,
      thrown: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
    return result;
  }
}
