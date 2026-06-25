/**
 * Supabase public.customers 스키마
 *
 * 실제 DB 테이블명: customers (고객 아님)
 * UI 라벨(한글) ↔ DB 컬럼(영문):
 *   이름      → name
 *   핸드폰    → phone
 *   메모      → memo
 *   사이트이름 → site_name
 *   상태      → status
 *   등록일    → created_at
 */
export const CUSTOMERS_TABLE = "customers" as const;

export const CUSTOMER_COLUMNS = {
  id: "id",
  name: "name",
  phone: "phone",
  memo: "memo",
  site_name: "site_name",
  status: "status",
  created_at: "created_at",
} as const;

export const CUSTOMER_SELECT =
  "id, site_name, name, phone, memo, status, created_at" as const;

export type CustomerInsertRow = {
  name: string;
  phone: string;
  memo: string | null;
  site_name: string;
};

export function buildCustomerInsertRow(
  input: { name: string; phone: string; memo: string | null },
  siteName: string,
): CustomerInsertRow {
  return {
    name: input.name,
    phone: input.phone,
    memo: input.memo,
    site_name: siteName,
  };
}
