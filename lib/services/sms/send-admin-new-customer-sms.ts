import "server-only";

import { getSmsEnv, logSmsEnvDiagnostic } from "@/lib/config/sms-env";
import { formatNewCustomerSmsMessage } from "@/lib/services/sms/message";
import { sendSMS } from "@/lib/services/sms/solapi-client";
import type {
  NewCustomerSmsPayload,
  SmsSendResult,
} from "@/lib/services/sms/types";

/**
 * 관심고객 등록 성공 후 관리자(ADMIN_PHONE)에게 SMS를 발송합니다.
 */
export async function sendAdminNewCustomerSms(
  payload: NewCustomerSmsPayload,
): Promise<SmsSendResult> {
  console.log("[sendAdminNewCustomerSms] called", payload);

  const { adminPhone, sender } = getSmsEnv();
  logSmsEnvDiagnostic("sendAdminNewCustomerSms");

  console.log("[sendAdminNewCustomerSms] ADMIN_PHONE:", adminPhone || "(empty)");
  console.log("[sendAdminNewCustomerSms] SOLAPI_SENDER:", sender || "(empty)");

  const message = formatNewCustomerSmsMessage(payload);
  console.log("[sendAdminNewCustomerSms] message preview:", message.slice(0, 80));

  return sendSMS({
    to: adminPhone,
    from: sender,
    text: message,
  });
}
