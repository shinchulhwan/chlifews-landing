import "server-only";

import { getSmsEnv } from "@/lib/config/sms";
import { formatNewCustomerSmsMessage } from "@/lib/services/sms/message";
import { sendSolapiSms } from "@/lib/services/sms/solapi-client";
import type {
  NewCustomerSmsPayload,
  SmsSendResult,
} from "@/lib/services/sms/types";

/**
 * 관심고객 등록 성공 후 관리자(ADMIN_PHONE)에게 SMS를 발송합니다.
 * 서버 전용 — 실패 시 예외를 throw하지 않습니다.
 */
export async function sendAdminNewCustomerSms(
  payload: NewCustomerSmsPayload,
): Promise<SmsSendResult> {
  const { adminPhone, sender } = getSmsEnv();
  const message = formatNewCustomerSmsMessage(payload);

  return sendSolapiSms({
    to: adminPhone,
    from: sender,
    text: message,
  });
}
