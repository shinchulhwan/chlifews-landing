"use server";

import { revalidatePath } from "next/cache";
import { sendAdminNewCustomerNotification } from "@/lib/notifications";
import { createSupabaseClient } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { normalizeCreatedAt } from "@/lib/format/created-at";
import { getSiteNameForInsert } from "@/lib/config/site";
import { buildNewCustomerSmsPayload } from "@/lib/services/sms/build-payload";
import { sendAdminNewCustomerSms } from "@/lib/services/sms";
import type { InterestCustomer } from "@/lib/types/interest-customer";
import {
  parseCustomerFormData,
  validateCustomer,
  type CustomerErrors,
  type CustomerInput,
} from "@/lib/validations/customer";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type InterestCustomerResult = {
  success: boolean;
  message: string;
  errors?: CustomerErrors;
};

const SUCCESS_MESSAGE = "관심고객 등록이 완료되었습니다.";
const FAILURE_MESSAGE = "등록에 실패했습니다.";

type SaveCustomerResult =
  | { ok: true; created_at: string | null }
  | { ok: false; error: PostgrestError };

function logSupabaseError(context: string, error: PostgrestError): void {
  console.error(`[${context}] Supabase error`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function toNotificationCustomer(
  data: CustomerInput,
  createdAt: string | null,
): InterestCustomer {
  return {
    id: "",
    name: data.name,
    phone: data.phone,
    type: null,
    visit_date: null,
    memo: data.memo,
    site_name: getSiteNameForInsert(),
    status: "pending",
    created_at: createdAt ?? new Date().toISOString(),
  };
}

async function insertCustomer(
  supabase: SupabaseClient<Database>,
  input: CustomerInput,
  context: string,
): Promise<SaveCustomerResult> {
  const siteName = (process.env.SITE_NAME ?? "").trim();

  console.log(
    "[submitInterestCustomer] SITE_NAME env:",
    siteName || "(empty)",
  );

  const row = {
    name: input.name,
    phone: input.phone,
    memo: input.memo,
    site_name: siteName,
  };

  const { error } = await supabase.from("customers").insert(row);

  if (error) {
    logSupabaseError(context, error);
    return { ok: false, error };
  }

  console.log(
    "[submitInterestCustomer] saved site_name:",
    siteName || "(empty)",
  );

  const { data: verify } = await supabase
    .from("customers")
    .select("created_at, site_name")
    .eq("phone", input.phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (verify) {
    console.log(
      "[submitInterestCustomer] verify site_name:",
      verify.site_name ?? "(null)",
    );
  }

  return {
    ok: true,
    created_at: normalizeCreatedAt(verify?.created_at),
  };
}

async function saveCustomer(input: CustomerInput): Promise<SaveCustomerResult> {
  const anonClient = createSupabaseClient();

  const anonResult = await insertCustomer(
    anonClient,
    input,
    "submitInterestCustomer:anon",
  );
  if (anonResult.ok) {
    return anonResult;
  }

  const serviceClient = tryCreateServiceRoleClient();
  if (serviceClient) {
    const serviceResult = await insertCustomer(
      serviceClient,
      input,
      "submitInterestCustomer:service_role",
    );
    if (serviceResult.ok) {
      return serviceResult;
    }
  }

  const { error: rpcError } = await anonClient.rpc("register_customer", {
    p_name: input.name,
    p_phone: input.phone,
    p_memo: input.memo,
    p_site_name: getSiteNameForInsert(),
  });

  if (!rpcError) {
    return { ok: true, created_at: null };
  }

  logSupabaseError("submitInterestCustomer:rpc", rpcError);
  return anonResult;
}

function safeRevalidateAdminPaths(): void {
  try {
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin");
  } catch (error) {
    console.warn("[submitInterestCustomer:revalidate]", error);
  }
}

export async function submitInterestCustomer(
  formData: FormData,
): Promise<InterestCustomerResult> {
  const parsed = parseCustomerFormData(formData);
  const validation = validateCustomer(parsed);

  if (!validation.success) {
    const firstError =
      Object.values(validation.errors)[0] ?? "입력값을 확인해 주세요.";
    return {
      success: false,
      message: firstError,
      errors: validation.errors,
    };
  }

  const customerInput = validation.data;

  try {
    const saveResult = await saveCustomer(customerInput);

    if (!saveResult.ok) {
      return { success: false, message: FAILURE_MESSAGE };
    }

    const smsPayload = buildNewCustomerSmsPayload(
      customerInput,
      saveResult.created_at,
    );

    try {
      await sendAdminNewCustomerSms(smsPayload);
    } catch (error) {
      console.log("===== SMS FAIL =====");
      console.log(
        error instanceof Error ? error.message : "알 수 없는 SMS 오류",
      );
    }

    const notificationCustomer = toNotificationCustomer(
      customerInput,
      saveResult.created_at,
    );

    try {
      await sendAdminNewCustomerNotification(notificationCustomer);
    } catch (error) {
      console.error("[submitInterestCustomer:notification]", error);
    }

    safeRevalidateAdminPaths();

    return { success: true, message: SUCCESS_MESSAGE };
  } catch (error) {
    console.error("[submitInterestCustomer]", error);
    return { success: false, message: FAILURE_MESSAGE };
  }
}
