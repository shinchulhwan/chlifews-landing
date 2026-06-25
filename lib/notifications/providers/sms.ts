import { sendAdminNewCustomerSms } from "@/lib/services/sms/send-admin-new-customer-sms";
import { buildNewCustomerSmsPayload } from "@/lib/services/sms/build-payload";
import type {
  AdminNotificationPayload,
  NotificationProvider,
  NotificationSendResult,
} from "@/lib/notifications/types";

/**
 * SMS 알림 Provider
 * SMS 발송 로직은 lib/services/sms 로 분리되어 있습니다.
 */
export const smsNotificationProvider: NotificationProvider = {
  name: "sms",

  isEnabled() {
    return false;
  },

  async send(payload: AdminNotificationPayload): Promise<NotificationSendResult> {
    const smsPayload = buildNewCustomerSmsPayload(
      {
        name: payload.name,
        phone: payload.phone,
        memo: null,
      },
      payload.createdAt,
    );

    const result = await sendAdminNewCustomerSms(smsPayload);

    return {
      provider: "sms",
      success: result.success,
      error: result.error,
    };
  },
};
