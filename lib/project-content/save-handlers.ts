import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCurrentSiteNameAsync } from "@/lib/project-content/site-name";
import {
  getFloorplanImagePath,
  getCommunityImagePath,
  getGalleryImagePath,
  getLocationMainImagePath,
  getOverviewImagePath,
  getPremiumCardImagePath,
  normalizeImageExtension,
} from "@/lib/project-content/storage-paths";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  deleteProjectCommunityItem,
  deleteProjectFloorplan,
  deleteProjectGalleryItem,
  deleteProjectPremiumCard,
  getProjectCommunity,
  getProjectFloorplans,
  getProjectGallery,
  getProjectLocation,
  getProjectOverview,
  getProjectPremium,
  insertProjectCommunityItem,
  insertProjectFloorplan,
  insertProjectGalleryItem,
  insertProjectPremiumCard,
  reorderProjectCommunity,
  reorderProjectFloorplans,
  reorderProjectGallery,
  reorderProjectPremiumCards,
  updateProjectCommunityItem,
  updateProjectFloorplan,
  updateProjectGalleryItem,
  updateProjectPremiumCard,
  uploadProjectImage,
  upsertProjectLocation,
  upsertProjectOverview,
  upsertProjectPremiumSection,
} from "@/lib/storage/project-content";
import type {
  LocationPoint,
  OverviewInfoCard,
  ProjectCommunityItem,
  ProjectFloorplan,
  ProjectGalleryItem,
  ProjectLocation,
  ProjectOverview,
  ProjectPremiumData,
} from "@/lib/types/project-content";
import { DEFAULT_OVERVIEW_INFO_CARDS } from "@/lib/types/project-content";

import type { ProjectContentActionResult } from "@/lib/types/admin-action-result";
import {
  getUploadFileName,
  isUploadFile,
  MAX_UPLOAD_FILE_SIZE,
} from "@/lib/admin/upload-utils";

const MAX_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;

export function revalidateProjectContentPages() {
  revalidatePath("/");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/premium");
  revalidatePath("/admin/location");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/community");
  revalidatePath("/admin/floorplans");
  revalidatePath("/admin/hero-background");
}

function parseJsonField<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function executeSaveOverview(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectOverview>> {
  console.log("[save:overview] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const sectionTitleRaw = formData.get("section_title");
  const descriptionRaw = formData.get("description");
  const sectionTitle =
    typeof sectionTitleRaw === "string" && sectionTitleRaw.length > 0
      ? sectionTitleRaw
      : "사업개요";
  const description = typeof descriptionRaw === "string" ? descriptionRaw : "";
  const infoCards = parseJsonField<OverviewInfoCard[]>(
    formData.get("info_cards"),
    DEFAULT_OVERVIEW_INFO_CARDS,
  );
  const existingImageUrl =
    String(formData.get("existing_image_url") ?? "").trim() || null;
  const imageFile = formData.get("image");

  try {
    let imageUrl = existingImageUrl;

    if (isUploadFile(imageFile)) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(imageFile));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }
      imageUrl = await uploadProjectImage(
        imageFile,
        getOverviewImagePath(siteName, ext),
      );
      console.log("[save:overview] imageUrl:", imageUrl);
    }

    console.log("[save:overview] DB save image_url:", imageUrl);

    const data = await upsertProjectOverview({
      site_name: siteName,
      section_title: sectionTitle || "사업개요",
      description,
      image_url: imageUrl,
      info_cards: infoCards,
    });

    revalidateProjectContentPages();
    console.log("[save:overview] Success", data.id);
    return { success: true, message: "사업개요가 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:overview] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeSavePremiumSection(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectPremiumData>> {
  console.log("[save:premium-section] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const sectionTitle = String(formData.get("section_title") ?? "").trim();
  const sectionDescription = String(formData.get("section_description") ?? "").trim();

  try {
    await upsertProjectPremiumSection(siteName, sectionTitle, sectionDescription);
    const data = await getProjectPremium();
    revalidateProjectContentPages();
    console.log("[save:premium-section] Success");
    return { success: true, message: "프리미엄 섹션이 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:premium-section] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeSavePremiumCard(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectPremiumData>> {
  console.log("[save:premium-card] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const cardId = String(formData.get("card_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const existingImageUrl =
    String(formData.get("existing_image_url") ?? "").trim() || null;
  const imageFile = formData.get("image");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  try {
    let imageUrl = existingImageUrl;

    if (isUploadFile(imageFile)) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(imageFile));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }
      const id = cardId || randomUUID();
      imageUrl = await uploadProjectImage(
        imageFile,
        getPremiumCardImagePath(siteName, id, ext),
      );

      if (cardId) {
        await updateProjectPremiumCard(cardId, siteName, {
          title,
          description,
          image_url: imageUrl,
        });
      } else {
        await insertProjectPremiumCard(siteName, {
          id,
          title,
          description,
          image_url: imageUrl,
          sort_order: sortOrder,
        });
      }
    } else if (cardId) {
      await updateProjectPremiumCard(cardId, siteName, { title, description });
    } else {
      const id = randomUUID();
      await insertProjectPremiumCard(siteName, {
        id,
        title,
        description,
        image_url: imageUrl,
        sort_order: sortOrder,
      });
    }

    const data = await getProjectPremium();
    revalidateProjectContentPages();
    console.log("[save:premium-card] Success");
    return { success: true, message: "프리미엄 카드가 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:premium-card] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeSaveLocation(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectLocation>> {
  console.log("[save:location] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const sectionTitle = String(formData.get("section_title") ?? "").trim();
  const points = parseJsonField<LocationPoint[]>(formData.get("points"), []);
  const existingImageUrl =
    String(formData.get("existing_image_url") ?? "").trim() || null;
  const imageFile = formData.get("image");

  try {
    let mainImageUrl = existingImageUrl;

    if (isUploadFile(imageFile)) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(imageFile));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }
      mainImageUrl = await uploadProjectImage(
        imageFile,
        getLocationMainImagePath(siteName, ext),
      );
      console.log("[save:location] imageUrl:", mainImageUrl);
    }

    console.log("[save:location] DB save main_image_url:", mainImageUrl);

    const data = await upsertProjectLocation({
      site_name: siteName,
      section_title: sectionTitle || "입지환경",
      main_image_url: mainImageUrl,
      points,
    });

    revalidateProjectContentPages();
    console.log("[save:location] Success", data.id);
    return { success: true, message: "입지환경이 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:location] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeUploadGallery(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectGalleryItem[]>> {
  console.log("[save:gallery] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const files: (File | Blob)[] = [];
  for (const entry of formData.getAll("files")) {
    if (isUploadFile(entry)) {
      files.push(entry);
    }
  }
  const currentItems = await getProjectGallery();
  let sortOrder = currentItems.length;

  if (files.length === 0) {
    return { success: false, message: "업로드할 이미지를 선택해 주세요." };
  }

  try {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(file));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }

      const id = randomUUID();
      const imageUrl = await uploadProjectImage(
        file,
        getGalleryImagePath(siteName, id, ext),
      );

      await insertProjectGalleryItem(siteName, {
        image_url: imageUrl,
        title: getUploadFileName(file).replace(/\.[^.]+$/, ""),
        sort_order: sortOrder,
        is_featured: currentItems.length === 0 && sortOrder === 0,
      });

      sortOrder += 1;
    }

    const data = await getProjectGallery();
    revalidateProjectContentPages();
    console.log("[save:gallery] Success", data.length);
    return { success: true, message: "갤러리 이미지가 업로드되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:gallery] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeSaveFloorplan(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectFloorplan[]>> {
  console.log("[save:floorplan] Saving...");

  const siteName = await getCurrentSiteNameAsync(formData);
  const itemId = String(formData.get("item_id") ?? "").trim();
  const typeName = String(formData.get("type_name") ?? "").trim();
  const supplyArea = String(formData.get("supply_area") ?? "").trim();
  const exclusiveArea = String(formData.get("exclusive_area") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const existingImageUrl =
    String(formData.get("existing_image_url") ?? "").trim() || null;
  const imageFile = formData.get("image");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  try {
    let imageUrl = existingImageUrl;

    if (isUploadFile(imageFile)) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(imageFile));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }
      const id = itemId || randomUUID();
      imageUrl = await uploadProjectImage(
        imageFile,
        getFloorplanImagePath(siteName, id, ext),
      );
    }

    if (itemId) {
      await updateProjectFloorplan(itemId, siteName, {
        type_name: typeName,
        supply_area: supplyArea,
        exclusive_area: exclusiveArea,
        description,
        image_url: imageUrl,
      });
    } else {
      const current = await getProjectFloorplans();
      await insertProjectFloorplan(siteName, {
        sort_order: sortOrder || current.length,
        type_name: typeName,
        supply_area: supplyArea,
        exclusive_area: exclusiveArea,
        description,
        image_url: imageUrl,
      });
    }

    const data = await getProjectFloorplans();
    revalidateProjectContentPages();
    console.log("[save:floorplan] Success", data.length);
    return { success: true, message: "평면도가 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:floorplan] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeSaveCommunity(
  formData: FormData,
): Promise<ProjectContentActionResult<ProjectCommunityItem[]>> {
  const siteName = await getCurrentSiteNameAsync(formData);

  const itemId = String(formData.get("item_id") ?? "").trim();
  const title = String(formData.get("title") ?? "");
  const subtitle = String(formData.get("subtitle") ?? "");
  const description = String(formData.get("description") ?? "");
  const existingImageUrl =
    String(formData.get("existing_image_url") ?? "").trim() || null;
  const imageFile = formData.get("image");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  try {
    let imageUrl = existingImageUrl;

    if (isUploadFile(imageFile)) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: "이미지 크기는 4MB 이하여야 합니다. (Vercel 업로드 한도)" };
      }
      const ext = normalizeImageExtension(getUploadFileName(imageFile));
      if (!ext) {
        return {
          success: false,
          message: "jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.",
        };
      }
      const id = itemId || randomUUID();
      imageUrl = await uploadProjectImage(
        imageFile,
        getCommunityImagePath(siteName, id, ext),
      );
    }

    if (!title.trim()) {
      return { success: false, message: "시설명을 입력해 주세요." };
    }

    if (itemId) {
      await updateProjectCommunityItem(itemId, siteName, {
        title,
        subtitle,
        description,
        image_url: imageUrl,
      });
    } else {
      const current = await getProjectCommunity(siteName);
      await insertProjectCommunityItem(siteName, {
        sort_order: sortOrder || current.length,
        title,
        subtitle,
        description,
        image_url: imageUrl,
      });
    }

    const data = await getProjectCommunity(siteName);
    revalidateProjectContentPages();
    return { success: true, message: "커뮤니티 시설이 저장되었습니다.", data };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("[save:community] Failed:", message, error);
    return { success: false, message };
  }
}

export async function executeDeleteCommunityItem(
  itemId: string,
): Promise<ProjectContentActionResult<ProjectCommunityItem[]>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await deleteProjectCommunityItem(itemId, siteName);
    const data = await getProjectCommunity(siteName);
    revalidateProjectContentPages();
    return { success: true, message: "시설이 삭제되었습니다.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeReorderCommunity(
  orderedIds: string[],
): Promise<ProjectContentActionResult<ProjectCommunityItem[]>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await reorderProjectCommunity(siteName, orderedIds);
    const data = await getProjectCommunity(siteName);
    revalidateProjectContentPages();
    return { success: true, message: "순서가 변경되었습니다.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeDeletePremiumCard(
  cardId: string,
): Promise<ProjectContentActionResult<ProjectPremiumData>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await deleteProjectPremiumCard(cardId, siteName);
    const data = await getProjectPremium();
    revalidateProjectContentPages();
    return { success: true, message: "카드가 삭제되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeReorderPremiumCards(
  orderedIds: string[],
): Promise<ProjectContentActionResult<ProjectPremiumData>> {
  try {
    await reorderProjectPremiumCards(await getCurrentSiteNameAsync(), orderedIds);
    const data = await getProjectPremium();
    revalidateProjectContentPages();
    return { success: true, message: "순서가 변경되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeDeleteGalleryItem(
  itemId: string,
): Promise<ProjectContentActionResult<ProjectGalleryItem[]>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await deleteProjectGalleryItem(itemId, siteName);
    const data = await getProjectGallery();
    revalidateProjectContentPages();
    return { success: true, message: "이미지가 삭제되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeSetGalleryFeatured(
  itemId: string,
): Promise<ProjectContentActionResult<ProjectGalleryItem[]>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await updateProjectGalleryItem(itemId, siteName, { is_featured: true });
    const data = await getProjectGallery();
    revalidateProjectContentPages();
    return { success: true, message: "대표 이미지가 설정되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeReorderGallery(
  orderedIds: string[],
): Promise<ProjectContentActionResult<ProjectGalleryItem[]>> {
  try {
    await reorderProjectGallery(await getCurrentSiteNameAsync(), orderedIds);
    const data = await getProjectGallery();
    revalidateProjectContentPages();
    return { success: true, message: "순서가 변경되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeDeleteFloorplan(
  itemId: string,
): Promise<ProjectContentActionResult<ProjectFloorplan[]>> {
  const siteName = await getCurrentSiteNameAsync();
  try {
    await deleteProjectFloorplan(itemId, siteName);
    const data = await getProjectFloorplans();
    revalidateProjectContentPages();
    return { success: true, message: "평면도가 삭제되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export async function executeReorderFloorplans(
  orderedIds: string[],
): Promise<ProjectContentActionResult<ProjectFloorplan[]>> {
  try {
    await reorderProjectFloorplans(await getCurrentSiteNameAsync(), orderedIds);
    const data = await getProjectFloorplans();
    revalidateProjectContentPages();
    return { success: true, message: "순서가 변경되었습니다.", data };
  } catch (error) {
    return { success: false, message: formatSupabaseError(error) };
  }
}

export {
  getProjectOverview,
  getProjectPremium,
  getProjectLocation,
  getProjectGallery,
  getProjectCommunity,
  getProjectFloorplans,
};
