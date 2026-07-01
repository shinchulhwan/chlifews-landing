"use server";

import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  executeDeleteFloorplan,
  executeDeleteGalleryItem,
  executeDeletePremiumCard,
  executeReorderFloorplans,
  executeReorderGallery,
  executeReorderPremiumCards,
  executeSaveFloorplan,
  executeSaveLocation,
  executeSaveOverview,
  executeSavePremiumCard,
  executeSavePremiumSection,
  executeSetGalleryFeatured,
  executeUploadGallery,
  getProjectFloorplans,
  getProjectGallery,
  getProjectLocation,
  getProjectOverview,
  getProjectPremium,
} from "@/lib/project-content/save-handlers";
import type {
  ProjectFloorplan,
  ProjectGalleryItem,
  ProjectLocation,
  ProjectOverview,
  ProjectPremiumData,
} from "@/lib/types/project-content";

export type { ProjectContentActionResult };

async function requireAdmin(): Promise<ProjectContentActionResult<never> | null> {
  if (!await isAdminAuthenticated()) {
    return { success: false, message: "관리자 로그인이 필요합니다." };
  }
  return null;
}

export async function getOverviewAdminAction(): Promise<
  ProjectContentActionResult<ProjectOverview | null>
> {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const data = await getProjectOverview();
    return { success: true, message: "ok", data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "조회 실패";
    return { success: false, message };
  }
}

export async function saveOverviewAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSaveOverview(formData);
}

export async function getPremiumAdminAction(): Promise<
  ProjectContentActionResult<ProjectPremiumData>
> {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const data = await getProjectPremium();
    return { success: true, message: "ok", data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "조회 실패";
    return { success: false, message };
  }
}

export async function savePremiumSectionAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSavePremiumSection(formData);
}

export async function savePremiumCardAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSavePremiumCard(formData);
}

export async function deletePremiumCardAction(cardId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeDeletePremiumCard(cardId);
}

export async function reorderPremiumCardsAction(orderedIds: string[]) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeReorderPremiumCards(orderedIds);
}

export async function getLocationAdminAction(): Promise<
  ProjectContentActionResult<ProjectLocation | null>
> {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const data = await getProjectLocation();
    return { success: true, message: "ok", data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "조회 실패";
    return { success: false, message };
  }
}

export async function saveLocationAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSaveLocation(formData);
}

export async function getGalleryAdminAction(): Promise<
  ProjectContentActionResult<ProjectGalleryItem[]>
> {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const data = await getProjectGallery();
    return { success: true, message: "ok", data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "조회 실패";
    return { success: false, message };
  }
}

export async function uploadGalleryImagesAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeUploadGallery(formData);
}

export async function deleteGalleryItemAction(itemId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeDeleteGalleryItem(itemId);
}

export async function setGalleryFeaturedAction(itemId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSetGalleryFeatured(itemId);
}

export async function reorderGalleryAction(orderedIds: string[]) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeReorderGallery(orderedIds);
}

export async function getFloorplansAdminAction(): Promise<
  ProjectContentActionResult<ProjectFloorplan[]>
> {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const data = await getProjectFloorplans();
    return { success: true, message: "ok", data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "조회 실패";
    return { success: false, message };
  }
}

export async function saveFloorplanAction(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeSaveFloorplan(formData);
}

export async function deleteFloorplanAction(itemId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeDeleteFloorplan(itemId);
}

export async function reorderFloorplansAction(orderedIds: string[]) {
  const authError = await requireAdmin();
  if (authError) return authError;
  return executeReorderFloorplans(orderedIds);
}
