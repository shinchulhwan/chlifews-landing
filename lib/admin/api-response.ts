"use client";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";

export type AdminFetchErrorDetails = {
  status: number;
  statusText: string;
  contentType: string | null;
  body: string;
};

export async function readAdminApiResponse<T>(
  response: Response,
  logPrefix: string,
): Promise<
  | { ok: true; result: ProjectContentActionResult<T> }
  | { ok: false; message: string; details: AdminFetchErrorDetails }
> {
  const status = response.status;
  const statusText = response.statusText;
  const contentType = response.headers.get("content-type");
  const body = await response.text();

  console.log(`[${logPrefix}] HTTP ${status} ${statusText}`, {
    contentType,
    bodyPreview: body.slice(0, 500),
  });

  const trimmed = body.trim();

  if (trimmed) {
    try {
      const result = JSON.parse(trimmed) as ProjectContentActionResult<T>;

      if (!response.ok || !result.success) {
        const message =
          result.message ||
          `요청 실패 (HTTP ${status}${statusText ? ` ${statusText}` : ""})`;
        console.error(`[${logPrefix}] Failed:`, message, result);
        return {
          ok: false,
          message,
          details: { status, statusText, contentType, body },
        };
      }

      return { ok: true, result };
    } catch (parseError) {
      console.error(`[${logPrefix}] JSON parse failed:`, parseError);
      if (parseError instanceof Error && parseError.stack) {
        console.error(`[${logPrefix}] parse stack:`, parseError.stack);
      }
    }
  }

  const message = [
    `HTTP ${status}${statusText ? ` ${statusText}` : ""}`,
    contentType ? `Content-Type: ${contentType}` : null,
    trimmed || "(empty response body)",
  ]
    .filter(Boolean)
    .join("\n");

  console.error(`[${logPrefix}] Non-JSON response:`, message);

  return {
    ok: false,
    message,
    details: { status, statusText, contentType, body },
  };
}

export function logAdminRequestError(logPrefix: string, error: unknown): string {
  const message =
    error instanceof Error ? error.message : "네트워크 오류로 요청에 실패했습니다.";
  console.error(`[${logPrefix}] Request failed:`, error);
  if (error instanceof Error && error.stack) {
    console.error(`[${logPrefix}] stack:`, error.stack);
  }
  return message;
}
