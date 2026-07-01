"use client";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  logAdminRequestError,
  readAdminApiResponse,
} from "@/lib/admin/api-response";
import type { SiteSettingsSectionId } from "@/lib/site-settings/fields";

export async function postSiteSettingsSection(
  section: SiteSettingsSectionId,
  formData: FormData,
): Promise<ProjectContentActionResult<Record<string, string>>> {
  formData.set("section", section);

  try {
    const response = await fetch("/api/admin/site-settings", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    const parsed = await readAdminApiResponse<Record<string, string>>(
      response,
      "admin-site-settings",
    );
    if (!parsed.ok) {
      return { success: false, message: parsed.message };
    }

    return parsed.result;
  } catch (error) {
    return {
      success: false,
      message: logAdminRequestError("admin-site-settings", error),
    };
  }
}
