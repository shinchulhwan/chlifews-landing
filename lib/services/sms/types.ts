export type SmsSendParams = {
  to: string;
  from: string;
  text: string;
};

export type SmsSendResult = {
  success: boolean;
  provider: "solapi";
  messageId?: string;
  error?: string;
  status?: number;
  response?: Record<string, unknown> | string;
};

export type NewCustomerSmsPayload = {
  name: string;
  phone: string;
  memo: string | null;
  created_at: string;
};
