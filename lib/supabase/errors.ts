import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const postgrestError = error as PostgrestError;
    const parts = [postgrestError.message];

    if (postgrestError.code) {
      parts.push(`(code: ${postgrestError.code})`);
    }

    if (postgrestError.details) {
      parts.push(postgrestError.details);
    }

    if (postgrestError.hint) {
      parts.push(postgrestError.hint);
    }

    return parts.join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

export function logSupabaseError(context: string, error: PostgrestError): void {
  console.log(error);
  console.error(`[${context}] Supabase error`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}
