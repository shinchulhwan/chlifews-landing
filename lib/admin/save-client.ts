"use client";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";

export type AdminSaveOperation =
  | "overview"
  | "premium-section"
  | "premium-card"
  | "location"
  | "gallery-upload"
  | "community"
  | "floorplan";

type JsonSaveOperation =
  | "premium-delete"
  | "premium-reorder"
  | "gallery-delete"
  | "gallery-featured"
  | "gallery-reorder"
  | "community-delete"
  | "community-reorder"
  | "floorplan-delete"
  | "floorplan-reorder";

export async function postAdminSave<T>(
  operation: AdminSaveOperation,
  formData: FormData,
): Promise<ProjectContentActionResult<T>> {
  console.log("Save button clicked");
  console.log("Saving...", operation);

  formData.set("operation", operation);

  try {
    const response = await fetch("/api/admin/project-content", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    let result: ProjectContentActionResult<T>;

    try {
      result = (await response.json()) as ProjectContentActionResult<T>;
    } catch (parseError) {
      const message = "서버 응답을 해석할 수 없습니다.";
      console.error("[admin-save] JSON parse failed:", parseError);
      return { success: false, message };
    }

    console.log("[admin-save] API response:", result);

    if (!response.ok || !result.success) {
      const message = result.message || `저장 실패 (HTTP ${response.status})`;
      console.error("[admin-save] Failed:", message);
      return { success: false, message, data: result.data };
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "네트워크 오류로 저장에 실패했습니다.";
    console.error("[admin-save] Request failed:", error);
    return { success: false, message };
  }
}

export async function postAdminJsonSave<T>(
  operation: JsonSaveOperation,
  payload: Record<string, unknown>,
): Promise<ProjectContentActionResult<T>> {
  console.log("Save button clicked");
  console.log("Saving...", operation, payload);

  try {
    const response = await fetch("/api/admin/project-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ operation, ...payload }),
    });

    let result: ProjectContentActionResult<T>;

    try {
      result = (await response.json()) as ProjectContentActionResult<T>;
    } catch (parseError) {
      const message = "서버 응답을 해석할 수 없습니다.";
      console.error("[admin-save] JSON parse failed:", parseError);
      return { success: false, message };
    }

    console.log("[admin-save] API response:", result);

    if (!response.ok || !result.success) {
      const message = result.message || `요청 실패 (HTTP ${response.status})`;
      console.error("[admin-save] Failed:", message);
      return { success: false, message, data: result.data };
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "네트워크 오류로 요청에 실패했습니다.";
    console.error("[admin-save] Request failed:", error);
    return { success: false, message };
  }
}

export function applySaveResult<T>(
  result: ProjectContentActionResult<T>,
  setToast: (toast: { type: "success" | "error"; message: string }) => void,
): boolean {
  if (result.success) {
    setToast({
      type: "success",
      message: result.message || "저장되었습니다.",
    });
    return true;
  }

  const message = result.message || "저장에 실패했습니다.";
  setToast({ type: "error", message });
  console.error("[admin-save] UI error:", message);
  return false;
}
