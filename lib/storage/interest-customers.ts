import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { tryCreateAnonClient } from "@/lib/supabase/client";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  CustomerSearchParams,
  InterestCustomer,
} from "@/lib/types/interest-customer";

export type { CustomerSearchParams, CustomerStatusFilter } from "@/lib/types/interest-customer";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "interest-customers.json");

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

// ─── JSON 폴백 ───────────────────────────────────────────

async function ensureJsonFile(): Promise<InterestCustomer[]> {
  try {
    const content = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as InterestCustomer[]) : [];
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, "[]", "utf-8");
    return [];
  }
}

async function writeJsonFile(customers: InterestCustomer[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(customers, null, 2), "utf-8");
}

function sortByLatest(customers: InterestCustomer[]): InterestCustomer[] {
  return [...customers].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

async function addInterestCustomerJson(
  customer: Omit<InterestCustomer, "id" | "status" | "created_at">,
): Promise<InterestCustomer> {
  const customers = await ensureJsonFile();
  const newCustomer: InterestCustomer = {
    id: crypto.randomUUID(),
    ...customer,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  customers.unshift(newCustomer);
  await writeJsonFile(customers);
  return newCustomer;
}

async function searchInterestCustomersJson(
  params: CustomerSearchParams = {},
): Promise<InterestCustomer[]> {
  const customers = await ensureJsonFile();
  const searchQuery = params.query?.trim().toLowerCase();
  const phoneQuery = params.phone?.trim();
  const status = params.status ?? "all";

  const filtered = customers.filter((customer) => {
    if (status !== "all" && customer.status !== status) return false;

    if (searchQuery) {
      const matches =
        customer.name.toLowerCase().includes(searchQuery) ||
        (customer.type?.toLowerCase().includes(searchQuery) ?? false) ||
        (customer.memo?.toLowerCase().includes(searchQuery) ?? false);
      if (!matches) return false;
    }

    if (phoneQuery) {
      const digits = normalizePhone(phoneQuery);
      const customerDigits = normalizePhone(customer.phone);
      if (digits && !customerDigits.includes(digits)) return false;
      if (!digits && !customer.phone.includes(phoneQuery)) return false;
    }

    return true;
  });

  return sortByLatest(filtered);
}

// ─── Supabase ────────────────────────────────────────────

export async function addInterestCustomer(
  customer: Omit<InterestCustomer, "id" | "status" | "created_at">,
): Promise<InterestCustomer> {
  const supabase = tryCreateAnonClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("interest_customers")
      .insert({
        name: customer.name,
        phone: customer.phone,
        type: customer.type,
        visit_date: customer.visit_date,
        memo: customer.memo,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("등록 데이터를 반환받지 못했습니다.");
    return data;
  }

  return addInterestCustomerJson(customer);
}

export async function searchInterestCustomers(
  params: CustomerSearchParams = {},
): Promise<InterestCustomer[]> {
  const supabase = tryCreateServiceRoleClient();

  if (supabase) {
    let query = supabase
      .from("interest_customers")
      .select("*")
      .order("created_at", { ascending: false });

    const searchQuery = params.query?.trim();
    const phoneQuery = params.phone?.trim();
    const status = params.status ?? "all";

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%,memo.ilike.%${searchQuery}%`,
      );
    }

    if (phoneQuery) {
      const digits = normalizePhone(phoneQuery);
      query = query.ilike("phone", `%${digits || phoneQuery}%`);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  if (isSupabaseConfigured() && !isSupabaseAdminConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 관리자 목록을 불러올 수 없습니다.",
    );
  }

  return searchInterestCustomersJson(params);
}

export async function deleteInterestCustomer(id: string): Promise<boolean> {
  const supabase = tryCreateServiceRoleClient();

  if (supabase) {
    const { error } = await supabase
      .from("interest_customers")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  const customers = await ensureJsonFile();
  const next = customers.filter((c) => c.id !== id);
  if (next.length === customers.length) return false;
  await writeJsonFile(next);
  return true;
}

export async function completeInterestCustomer(id: string): Promise<boolean> {
  const supabase = tryCreateServiceRoleClient();

  if (supabase) {
    const { error } = await supabase
      .from("interest_customers")
      .update({ status: "completed" })
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  const customers = await ensureJsonFile();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return false;
  customers[index] = { ...customers[index], status: "completed" };
  await writeJsonFile(customers);
  return true;
}

export async function readInterestCustomers(): Promise<InterestCustomer[]> {
  return searchInterestCustomers();
}
