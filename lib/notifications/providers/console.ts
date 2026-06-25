import { formatNotificationMessage } from "@/lib/notifications/format";
import type {
  AdminNotificationPayload,
  NotificationProvider,
  NotificationSendResult,
} from "@/lib/notifications/types";

export const consoleNotificationProvider: NotificationProvider = {
  name: "console",

  isEnabled() {
    return true;
  },

  async send(payload: AdminNotificationPayload): Promise<NotificationSendResult> {
    console.info("[admin-notification]", formatNotificationMessage(payload));
    return { provider: "console", success: true };
  },
};
