import { formatNotificationMessage } from "@/lib/notifications/format";
import type {
  AdminNotificationPayload,
  NotificationProvider,
  NotificationSendResult,
} from "@/lib/notifications/types";

/**
 * 카카오 알림 Provider (스텁)
 *
 * 연동 시 환경 변수 예시:
 * - KAKAO_API_URL
 * - KAKAO_API_KEY
 * - KAKAO_ADMIN_ID (관리자 카카오 ID 또는 채널)
 */
export const kakaoNotificationProvider: NotificationProvider = {
  name: "kakao",

  isEnabled() {
    return Boolean(
      process.env.KAKAO_API_URL &&
        process.env.KAKAO_API_KEY &&
        process.env.KAKAO_ADMIN_ID,
    );
  },

  async send(payload: AdminNotificationPayload): Promise<NotificationSendResult> {
    if (!this.isEnabled()) {
      return {
        provider: "kakao",
        success: false,
        error: "카카오 API가 설정되지 않았습니다.",
      };
    }

    const message = formatNotificationMessage(payload);

  // TODO: 카카오 알림 API 연동
  // await fetch(process.env.KAKAO_API_URL!, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.KAKAO_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     receiverId: process.env.KAKAO_ADMIN_ID,
  //     message,
  //   }),
  // });

    console.info("[kakao-notification:stub]", message);

    return { provider: "kakao", success: true };
  },
};
