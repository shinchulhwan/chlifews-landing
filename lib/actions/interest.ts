"use server";

import { revalidatePath } from "next/cache";
import { sendAdminNewCustomerNotification } from "@/lib/notifications";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import {
  buildCustomerInsertRow,
  CUSTOMERS_TABLE,
  CUSTOMER_COLUMNS,
} from "@/lib/supabase/customers-schema";
import { normalizeCreatedAt } from "@/lib/format/created-at";
import { getSiteNameForInsert } from "@/lib/config/site";
import { isSolapiSmsConfigured, logSmsEnvDiagnostic } from "@/lib/config/sms-env";
import { buildNewCustomerSmsPayload } from "@/lib/services/sms/build-payload";
import { sendAdminNewCustomerSms } from "@/lib/services/sms";
import type { InterestCustomer } from "@/lib/types/interest-customer";
import {
  parseCustomerFormData,
  validateCustomer,
  validatePrivacyConsent,
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
  console.error(`[${context}] Supabase error`, error);
  console.error(`[${context}] Supabase error message:`, error.message);
}

function toNotificationCustomer(
  data: CustomerInput,
  createdAt: string | null,
  siteName: string,
): InterestCustomer {
  return {
    id: "",
    name: data.name,
    phone: data.phone,
    type: null,
    visit_date: null,
    memo: data.memo,
    site_name: siteName,
    status: "pending",
    created_at: createdAt ?? new Date().toISOString(),
  };
}

async function insertCustomer(
  supabase: SupabaseClient<Database>,
  input: CustomerInput,
  context: string,
  siteName: string,
): Promise<SaveCustomerResult> {
  const row = buildCustomerInsertRow(input, siteName);

  console.log(`[${context}] table:`, CUSTOMERS_TABLE);
  console.log(`[${context}] insert row:`, row);

  const { error } = await supabase.from(CUSTOMERS_TABLE).insert(row);

  if (error) {
    console.error(`[${context}] insert failed:`, error);
    console.error(`[${context}] insert failed message:`, error.message);
    logSupabaseError(context, error);
    return { ok: false, error };
  }

  console.log(
    "[submitInterestCustomer] saved site_name:",
    siteName || "(empty)",
  );

  const { data: verify, error: verifyError } = await supabase
    .from(CUSTOMERS_TABLE)
    .select(`${CUSTOMER_COLUMNS.created_at}, ${CUSTOMER_COLUMNS.site_name}`)
    .eq(CUSTOMER_COLUMNS.phone, input.phone)
    .order(CUSTOMER_COLUMNS.created_at, { ascending: false })
    .limit(1)
    .maybeSingle();

  if (verifyError) {
    console.error(`[${context}] verify select failed:`, verifyError);
    console.error(`[${context}] verify select message:`, verifyError.message);
  }

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

async function saveCustomer(
  input: CustomerInput,
  siteName: string,
): Promise<SaveCustomerResult> {
  if (!isSupabaseConfigured()) {
    const configError = {
      message:
        "Supabase 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
      code: "ENV_MISSING",
      details: "",
      hint: "",
    } as PostgrestError;
    console.error("[saveCustomer] Supabase not configured");
    return { ok: false, error: configError };
  }

  const anonClient = createSupabaseClient();

  const anonResult = await insertCustomer(
    anonClient,
    input,
    "submitInterestCustomer:anon",
    siteName,
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
      siteName,
    );
    if (serviceResult.ok) {
      return serviceResult;
    }
    return serviceResult;
  }

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
  const privacyErrors = validatePrivacyConsent(formData);
  const validation = validateCustomer(parsed);

  if (Object.keys(privacyErrors).length > 0) {
    const firstError =
      Object.values(privacyErrors)[0] ?? "개인정보 수집 및 이용에 동의해 주세요.";
    return {
      success: false,
      message: firstError,
      errors: privacyErrors,
    };
  }

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
  const siteName =
    String(formData.get("site_name") ?? "").trim() || getSiteNameForInsert();

  try {
    const saveResult = await saveCustomer(customerInput, siteName);

    if (!saveResult.ok) {
      console.error("[submitInterestCustomer] insert failed:", saveResult.error);
      console.error(
        "[submitInterestCustomer] insert failed message:",
        saveResult.error.message,
      );
      return {
        success: false,
        message: saveResult.error.message || FAILURE_MESSAGE,
      };
    }

    const smsPayload = buildNewCustomerSmsPayload(
      customerInput,
      saveResult.created_at,
    );

    logSmsEnvDiagnostic("submitInterestCustomer:before-sms");
    console.log(
      "[submitInterestCustomer] SMS configured:",
      isSolapiSmsConfigured(),
    );
    console.log("[submitInterestCustomer] calling sendAdminNewCustomerSms");
    console.log("[submitInterestCustomer] SMS payload:", smsPayload);

    const smsResult = await sendAdminNewCustomerSms(smsPayload);

    console.log(
      "[submitInterestCustomer] SMS result:",
      JSON.stringify(smsResult, null, 2),
    );

    if (!smsResult.success) {
      console.log("===== SMS FAIL =====");
      console.log("[submitInterestCustomer] SMS error:", smsResult.error);
      console.log(
        "[submitInterestCustomer] SMS response:",
        JSON.stringify(smsResult.response ?? null, null, 2),
      );
    } else {
      console.log("===== SMS SUCCESS =====");
      console.log(
        "[submitInterestCustomer] messageId:",
        smsResult.messageId ?? "(none)",
      );
    }

    const notificationCustomer = toNotificationCustomer(
      customerInput,
      saveResult.created_at,
      siteName,
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
    console.error(
      "[submitInterestCustomer]",
      error instanceof Error ? error.message : error,
    );
    return {
      success: false,
      message: formatSupabaseError(error) || FAILURE_MESSAGE,
    };
  }
}
