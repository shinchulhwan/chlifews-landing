export type AdminNotificationPayload = {
  customerId: string;
  name: string;
  phone: string;
  type: string | null;
  createdAt: string;
};

export type NotificationSendResult = {
  provider: string;
  success: boolean;
  error?: string;
};

export interface NotificationProvider {
  readonly name: string;
  isEnabled(): boolean;
  send(payload: AdminNotificationPayload): Promise<NotificationSendResult>;
}
