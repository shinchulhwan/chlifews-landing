import type { NewCustomerSmsPayload } from "@/lib/services/sms/types";

export function formatNewCustomerSmsMessage(
  payload: NewCustomerSmsPayload,
): string {
  const memo = payload.memo?.trim() || "-";
  const createdAt = payload.created_at.trim() || "-";

  return `[신규 관심고객]

이름 : ${payload.name}

전화 : ${payload.phone}

문의내용 : ${memo}

등록시간 : ${createdAt}`;
}
