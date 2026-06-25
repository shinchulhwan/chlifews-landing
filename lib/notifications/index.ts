import { consoleNotificationProvider } from "@/lib/notifications/providers/console";
import { kakaoNotificationProvider } from "@/lib/notifications/providers/kakao";
import { toNotificationPayload } from "@/lib/notifications/format";
import type {
  NotificationProvider,
  NotificationSendResult,
} from "@/lib/notifications/types";
import type { InterestCustomer } from "@/lib/types/interest-customer";

const ALL_PROVIDERS: NotificationProvider[] = [
  consoleNotificationProvider,
  kakaoNotificationProvider,
];

function getActiveProviders(): NotificationProvider[] {
  return ALL_PROVIDERS.filter((provider) => provider.isEnabled());
}

async function sendViaProvider(
  provider: NotificationProvider,
  payload: ReturnType<typeof toNotificationPayload>,
): Promise<NotificationSendResult> {
  try {
    return await provider.send(payload);
  } catch (error) {
    console.error(`[notification:${provider.name}]`, error);
    return {
      provider: provider.name,
      success: false,
      error: error instanceof Error ? error.message : "알림 전송 실패",
    };
  }
}

/**
 * 관심고객 등록 시 관리자에게 알림을 전송합니다.
 * 알림 실패 시에도 예외를 throw하지 않습니다.
 */
export async function sendAdminNewCustomerNotification(
  customer: InterestCustomer,
): Promise<NotificationSendResult[]> {
  const payload = toNotificationPayload(customer);
  const providers = getActiveProviders();

  const results = await Promise.all(
    providers.map((provider) => sendViaProvider(provider, payload)),
  );

  const failed = results.filter((result) => !result.success);
  if (failed.length > 0) {
    console.warn(
      "[notification] some providers failed:",
      failed.map((r) => `${r.provider}: ${r.error ?? "unknown"}`).join(", "),
    );
  }

  return results;
}
