"use client";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  logAdminRequestError,
  readAdminApiResponse,
} from "@/lib/admin/api-response";

export async function postSeoMetaField(
  key: string,
  formData: FormData,
): Promise<ProjectContentActionResult<{ key: string; value: string }>> {
  formData.set("key", key);

  try {
    const response = await fetch("/api/admin/seo-meta", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    const parsed = await readAdminApiResponse<{ key: string; value: string }>(
      response,
      "admin-seo-meta",
    );
    if (!parsed.ok) {
      return { success: false, message: parsed.message };
    }

    return parsed.result;
  } catch (error) {
    return {
      success: false,
      message: logAdminRequestError("admin-seo-meta", error),
    };
  }
}
