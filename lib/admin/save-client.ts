"use client";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  logAdminRequestError,
  readAdminApiResponse,
} from "@/lib/admin/api-response";

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
  formData.set("operation", operation);

  try {
    const response = await fetch("/api/admin/project-content", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    const parsed = await readAdminApiResponse<T>(response, "admin-save");
    if (!parsed.ok) {
      return { success: false, message: parsed.message };
    }

    return parsed.result;
  } catch (error) {
    return { success: false, message: logAdminRequestError("admin-save", error) };
  }
}

export async function postAdminJsonSave<T>(
  operation: JsonSaveOperation,
  payload: Record<string, unknown>,
): Promise<ProjectContentActionResult<T>> {
  try {
    const response = await fetch("/api/admin/project-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ operation, ...payload }),
    });

    const parsed = await readAdminApiResponse<T>(response, "admin-save");
    if (!parsed.ok) {
      return { success: false, message: parsed.message };
    }

    return parsed.result;
  } catch (error) {
    return { success: false, message: logAdminRequestError("admin-save", error) };
  }
}

export async function postAdminHeroBackgroundSave(
  formData: FormData,
): Promise<ProjectContentActionResult<{ backgroundUrl: string; publicUrl: string }>> {
  try {
    const response = await fetch("/api/admin/hero-background", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    const parsed = await readAdminApiResponse<{
      backgroundUrl: string;
      publicUrl: string;
    }>(response, "admin-hero-background");

    if (!parsed.ok) {
      return { success: false, message: parsed.message };
    }

    return parsed.result;
  } catch (error) {
    return {
      success: false,
      message: logAdminRequestError("admin-hero-background", error),
    };
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
