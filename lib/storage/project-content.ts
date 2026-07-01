import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import { getCurrentSiteName } from "@/lib/project-content/site-name";
import { mergeOverviewInfoCards } from "@/lib/project-content/overview-info-cards";
import { sanitizeStorageKey } from "@/lib/storage/storage-key";
import {
  buildPublicStorageUrl,
  normalizeImageExtension,
  SITE_ASSETS_BUCKET,
} from "@/lib/storage/site-assets";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type {
  LocationPoint,
  OverviewInfoCard,
  ProjectFloorplan,
  ProjectCommunityItem,
  ProjectGalleryItem,
  ProjectLocation,
  ProjectOverview,
  ProjectPremiumCard,
  ProjectPremiumData,
  ProjectPremiumSection,
} from "@/lib/types/project-content";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

function getReadClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return tryCreateServiceRoleClient() ?? createSupabaseClient();
}

function getWriteClient(): SupabaseClient<Database> {
  const client = tryCreateServiceRoleClient();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 필요합니다. 콘텐츠 저장 및 Storage 업로드에 service role이 필요합니다.",
    );
  }
  return client;
}

function parseInfoCards(raw: unknown): OverviewInfoCard[] {
  if (!Array.isArray(raw)) return mergeOverviewInfoCards(null);
  const parsed = raw
    .filter((item): item is OverviewInfoCard => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as OverviewInfoCard).id === "string" &&
        typeof (item as OverviewInfoCard).label === "string" &&
        typeof (item as OverviewInfoCard).value === "string"
      );
    })
    .map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
    }));
  return mergeOverviewInfoCards(parsed);
}

function parseLocationPoints(raw: unknown): LocationPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is LocationPoint => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as LocationPoint).id === "string" &&
        typeof (item as LocationPoint).icon === "string" &&
        typeof (item as LocationPoint).title === "string" &&
        typeof (item as LocationPoint).description === "string"
      );
    })
    .map((item) => ({
      ...item,
      sort_order: typeof item.sort_order === "number" ? item.sort_order : 0,
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function uploadProjectImage(
  file: File | Blob,
  objectPath: string,
  fileName?: string,
): Promise<string> {
  const name = fileName ?? (file instanceof File ? file.name : "upload.jpg");
  const extension = normalizeImageExtension(name);
  if (!extension) {
    throw new Error("jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.");
  }

  const supabase = getWriteClient();
  const { url: supabaseUrl } = getSupabaseEnv();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    (file instanceof File && file.type) ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg");

  const safePath = sanitizeStorageKey(objectPath);

  const { error } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(safePath, buffer, {
      upsert: true,
      contentType,
      cacheControl: "3600",
    });

  if (error) {
    console.error("[project-content:storage-upload]", safePath, error.message);
    throw new Error(`Storage 업로드 실패: ${error.message}`);
  }

  return buildPublicStorageUrl(supabaseUrl, safePath);
}

// ─── Overview ───────────────────────────────────────────────

export async function getProjectOverview(
  siteName = getCurrentSiteName(),
): Promise<ProjectOverview | null> {
  const supabase = getReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("project_overview")
    .select("*")
    .eq("site_name", siteName)
    .maybeSingle();

  if (error) {
    logSupabaseError("project_overview:select", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    info_cards: parseInfoCards(data.info_cards),
  };
}

export async function upsertProjectOverview(
  input: Omit<ProjectOverview, "id" | "updated_at"> & { id?: string },
): Promise<ProjectOverview> {
  const supabase = getWriteClient();
  const payload = {
    site_name: input.site_name,
    section_title: input.section_title,
    description: input.description,
    image_url: input.image_url,
    info_cards: input.info_cards,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("project_overview")
    .upsert(payload, { onConflict: "site_name" })
    .select("*")
    .single();

  if (error) {
    logSupabaseError("project_overview:upsert", error);
    throw error;
  }

  return { ...data, info_cards: parseInfoCards(data.info_cards) };
}

// ─── Premium ────────────────────────────────────────────────

function mapPremiumSection(row: {
  id: string;
  site_name: string;
  title: string;
  description: string;
  updated_at: string;
}): ProjectPremiumSection {
  return {
    id: row.id,
    site_name: row.site_name,
    section_title: row.title,
    section_description: row.description,
    updated_at: row.updated_at,
  };
}

function mapPremiumCard(row: {
  id: string;
  site_name: string;
  sort_order: number;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}): ProjectPremiumCard {
  return {
    id: row.id,
    site_name: row.site_name,
    sort_order: row.sort_order,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getProjectPremium(
  siteName = getCurrentSiteName(),
): Promise<ProjectPremiumData> {
  const supabase = getReadClient();
  const emptySection: ProjectPremiumSection = {
    id: "",
    site_name: siteName,
    section_title: "프리미엄 / 미래가치",
    section_description: "",
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    return { section: emptySection, cards: [] };
  }

  const { data, error } = await supabase
    .from("project_premium")
    .select("*")
    .eq("site_name", siteName)
    .order("sort_order", { ascending: true });

  if (error) {
    logSupabaseError("project_premium:select", error);
    return { section: emptySection, cards: [] };
  }

  const rows = data ?? [];
  const sectionRow = rows.find((row) => row.record_kind === "section");
  const cardRows = rows.filter((row) => row.record_kind === "card");

  return {
    section: sectionRow
      ? mapPremiumSection(sectionRow)
      : emptySection,
    cards: cardRows.map(mapPremiumCard),
  };
}

export async function upsertProjectPremiumSection(
  siteName: string,
  sectionTitle: string,
  sectionDescription: string,
): Promise<ProjectPremiumSection> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("project_premium")
    .select("id")
    .eq("site_name", siteName)
    .eq("record_kind", "section")
    .maybeSingle();

  const payload = {
    site_name: siteName,
    record_kind: "section" as const,
    sort_order: -1,
    title: sectionTitle,
    description: sectionDescription,
    image_url: null,
    updated_at: now,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("project_premium")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return mapPremiumSection(data);
  }

  const { data, error } = await supabase
    .from("project_premium")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return mapPremiumSection(data);
}

export async function insertProjectPremiumCard(
  siteName: string,
  input: {
    id?: string;
    title: string;
    description: string;
    image_url: string | null;
    sort_order: number;
  },
): Promise<ProjectPremiumCard> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_premium")
    .insert({
      id: input.id,
      site_name: siteName,
      record_kind: "card",
      sort_order: input.sort_order,
      title: input.title,
      description: input.description,
      image_url: input.image_url,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPremiumCard(data);
}

export async function updateProjectPremiumCard(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    image_url: string | null;
    sort_order: number;
  }>,
): Promise<ProjectPremiumCard> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_premium")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("record_kind", "card")
    .select("*")
    .single();

  if (error) throw error;
  return mapPremiumCard(data);
}

export async function deleteProjectPremiumCard(id: string): Promise<void> {
  const supabase = getWriteClient();
  const { error } = await supabase
    .from("project_premium")
    .delete()
    .eq("id", id)
    .eq("record_kind", "card");

  if (error) throw error;
}

export async function reorderProjectPremiumCards(
  siteName: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("project_premium")
        .update({ sort_order: index, updated_at: now })
        .eq("id", id)
        .eq("site_name", siteName)
        .eq("record_kind", "card"),
    ),
  );
}

// ─── Location ───────────────────────────────────────────────

export async function getProjectLocation(
  siteName = getCurrentSiteName(),
): Promise<ProjectLocation | null> {
  const supabase = getReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("project_location")
    .select("*")
    .eq("site_name", siteName)
    .maybeSingle();

  if (error) {
    logSupabaseError("project_location:select", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    points: parseLocationPoints(data.points),
  };
}

export async function upsertProjectLocation(
  input: Omit<ProjectLocation, "id" | "updated_at"> & { id?: string },
): Promise<ProjectLocation> {
  const supabase = getWriteClient();
  const payload = {
    site_name: input.site_name,
    section_title: input.section_title,
    main_image_url: input.main_image_url,
    points: input.points,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("project_location")
    .upsert(payload, { onConflict: "site_name" })
    .select("*")
    .single();

  if (error) throw error;

  return { ...data, points: parseLocationPoints(data.points) };
}

// ─── Gallery ────────────────────────────────────────────────

function mapGalleryItem(row: {
  id: string;
  site_name: string;
  sort_order: number;
  image_url: string;
  title: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}): ProjectGalleryItem {
  return { ...row };
}

export async function getProjectGallery(
  siteName = getCurrentSiteName(),
): Promise<ProjectGalleryItem[]> {
  const supabase = getReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("project_gallery")
    .select("*")
    .eq("site_name", siteName)
    .order("sort_order", { ascending: true });

  if (error) {
    logSupabaseError("project_gallery:select", error);
    return [];
  }

  return (data ?? []).map(mapGalleryItem);
}

export async function insertProjectGalleryItem(
  siteName: string,
  input: { image_url: string; title: string; sort_order: number; is_featured?: boolean },
): Promise<ProjectGalleryItem> {
  const supabase = getWriteClient();

  if (input.is_featured) {
    await supabase
      .from("project_gallery")
      .update({ is_featured: false, updated_at: new Date().toISOString() })
      .eq("site_name", siteName);
  }

  const { data, error } = await supabase
    .from("project_gallery")
    .insert({
      site_name: siteName,
      sort_order: input.sort_order,
      image_url: input.image_url,
      title: input.title,
      is_featured: input.is_featured ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapGalleryItem(data);
}

export async function updateProjectGalleryItem(
  id: string,
  input: Partial<{ title: string; sort_order: number; is_featured: boolean }>,
): Promise<ProjectGalleryItem> {
  const supabase = getWriteClient();

  if (input.is_featured) {
    const { data: row } = await supabase
      .from("project_gallery")
      .select("site_name")
      .eq("id", id)
      .single();

    if (row?.site_name) {
      await supabase
        .from("project_gallery")
        .update({ is_featured: false, updated_at: new Date().toISOString() })
        .eq("site_name", row.site_name);
    }
  }

  const { data, error } = await supabase
    .from("project_gallery")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapGalleryItem(data);
}

export async function deleteProjectGalleryItem(id: string): Promise<void> {
  const supabase = getWriteClient();
  const { error } = await supabase.from("project_gallery").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderProjectGallery(
  siteName: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("project_gallery")
        .update({ sort_order: index, updated_at: now })
        .eq("id", id)
        .eq("site_name", siteName),
    ),
  );
}

// ─── Floorplans ─────────────────────────────────────────────

function mapFloorplan(row: {
  id: string;
  site_name: string;
  sort_order: number;
  type_name: string;
  supply_area: string;
  exclusive_area: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}): ProjectFloorplan {
  return { ...row };
}

export async function getProjectFloorplans(
  siteName = getCurrentSiteName(),
): Promise<ProjectFloorplan[]> {
  const supabase = getReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("project_floorplans")
    .select("*")
    .eq("site_name", siteName)
    .order("sort_order", { ascending: true });

  if (error) {
    logSupabaseError("project_floorplans:select", error);
    return [];
  }

  return (data ?? []).map(mapFloorplan);
}

export async function insertProjectFloorplan(
  siteName: string,
  input: Omit<ProjectFloorplan, "id" | "site_name" | "created_at" | "updated_at">,
): Promise<ProjectFloorplan> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_floorplans")
    .insert({
      site_name: siteName,
      sort_order: input.sort_order,
      type_name: input.type_name,
      supply_area: input.supply_area,
      exclusive_area: input.exclusive_area,
      description: input.description,
      image_url: input.image_url,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapFloorplan(data);
}

export async function updateProjectFloorplan(
  id: string,
  input: Partial<{
    type_name: string;
    supply_area: string;
    exclusive_area: string;
    description: string;
    image_url: string | null;
    sort_order: number;
  }>,
): Promise<ProjectFloorplan> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_floorplans")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapFloorplan(data);
}

export async function deleteProjectFloorplan(id: string): Promise<void> {
  const supabase = getWriteClient();
  const { error } = await supabase.from("project_floorplans").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderProjectFloorplans(
  siteName: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("project_floorplans")
        .update({ sort_order: index, updated_at: now })
        .eq("id", id)
        .eq("site_name", siteName),
    ),
  );
}

// ─── Community ──────────────────────────────────────────────

function mapCommunityItem(row: {
  id: string;
  site_name: string;
  sort_order: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}): ProjectCommunityItem {
  return { ...row };
}

export async function getProjectCommunity(
  siteName = getCurrentSiteName(),
): Promise<ProjectCommunityItem[]> {
  const supabase = getReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("project_community")
    .select("*")
    .eq("site_name", siteName)
    .order("sort_order", { ascending: true });

  if (error) {
    logSupabaseError("project_community:select", error);
    return [];
  }

  return (data ?? []).map(mapCommunityItem);
}

export async function insertProjectCommunityItem(
  siteName: string,
  input: Omit<ProjectCommunityItem, "id" | "site_name" | "created_at" | "updated_at">,
): Promise<ProjectCommunityItem> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_community")
    .insert({
      site_name: siteName,
      sort_order: input.sort_order,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      image_url: input.image_url,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[project_community:insert] Supabase error:", error);
    throw error;
  }
  return mapCommunityItem(data);
}

export async function updateProjectCommunityItem(
  id: string,
  input: Partial<{
    title: string;
    subtitle: string;
    description: string;
    image_url: string | null;
    sort_order: number;
  }>,
): Promise<ProjectCommunityItem> {
  const supabase = getWriteClient();
  const { data, error } = await supabase
    .from("project_community")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[project_community:update] Supabase error:", error);
    throw error;
  }
  return mapCommunityItem(data);
}

export async function deleteProjectCommunityItem(id: string): Promise<void> {
  const supabase = getWriteClient();
  const { error } = await supabase.from("project_community").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderProjectCommunity(
  siteName: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = getWriteClient();
  const now = new Date().toISOString();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("project_community")
        .update({ sort_order: index, updated_at: now })
        .eq("id", id)
        .eq("site_name", siteName),
    ),
  );
}
