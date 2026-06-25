import type { CustomerStatus } from "@/lib/types/interest-customer";

export type Customer = {
  id: number | string;
  name: string;
  phone: string;
  memo: string | null;
  site_name: string;
  status?: CustomerStatus;
  created_at: string | null;
};
