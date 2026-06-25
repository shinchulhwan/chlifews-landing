import type { AdminNotificationPayload } from "@/lib/notifications/types";
import type { InterestCustomer } from "@/lib/types/interest-customer";

export function toNotificationPayload(
  customer: InterestCustomer,
): AdminNotificationPayload {
  return {
    customerId: String(customer.id),
    name: customer.name,
    phone: customer.phone,
    type: customer.type,
    createdAt: customer.created_at ?? new Date().toISOString(),
  };
}

export function formatNotificationMessage(
  payload: AdminNotificationPayload,
): string {
  const type = payload.type ?? "미선택";
  const createdAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(payload.createdAt));

  return `[관심고객 등록] 이름: ${payload.name} | 연락처: ${payload.phone} | 관심유형: ${type} | 등록시간: ${createdAt}`;
}
