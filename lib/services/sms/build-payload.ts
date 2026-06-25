import "server-only";

import { formatCreatedAt } from "@/lib/format/created-at";
import type { CustomerInput } from "@/lib/validations/customer";
import type { NewCustomerSmsPayload } from "@/lib/services/sms/types";

export function buildNewCustomerSmsPayload(
  input: CustomerInput,
  createdAt?: string | null,
): NewCustomerSmsPayload {
  const formattedCreatedAt =
    createdAt && formatCreatedAt(createdAt) !== "-"
      ? formatCreatedAt(createdAt)
      : formatCreatedAt(new Date().toISOString());

  return {
    name: input.name,
    phone: input.phone,
    memo: input.memo,
    created_at: formattedCreatedAt,
  };
}
