import { cloneProjectContent } from "@/lib/projects/clone";
import type { ProjectRecord } from "@/lib/projects/types";
import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { logSupabaseError } from "@/lib/supabase/errors";
import {
  copyProjectStorageAssets,
  rewriteStorageUrl,
} from "@/services/storage-copy-service";

export type CloneSiteResult = {
  dbCopied: boolean;
  storageCopied: number;
  storageSkipped: number;
  storageErrors: string[];
};

async function rewriteContentImageUrls(
  siteName: string,
  sourceStorageSlug: string,
  targetStorageSlug: string,
): Promise<void> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return;

  const rewrite = (url: string | null) =>
    rewriteStorageUrl(url, sourceStorageSlug, targetStorageSlug);

  const { data: overview } = await supabase
    .from("project_overview")
    .select("id, image_url")
    .eq("site_name", siteName)
    .maybeSingle();

  if (overview?.image_url) {
    await supabase
      .from("project_overview")
      .update({ image_url: rewrite(overview.image_url) })
      .eq("site_name", siteName);
  }

  const { data: location } = await supabase
    .from("project_location")
    .select("id, main_image_url")
    .eq("site_name", siteName)
    .maybeSingle();

  if (location?.main_image_url) {
    await supabase
      .from("project_location")
      .update({ main_image_url: rewrite(location.main_image_url) })
      .eq("site_name", siteName);
  }

  for (const table of ["project_premium", "project_gallery", "project_community", "project_floorplans"] as const) {
    const { data: rows, error } = await supabase
      .from(table)
      .select("id, image_url")
      .eq("site_name", siteName);

    if (error) {
      logSupabaseError(`clone:rewrite:${table}`, error);
      continue;
    }

    for (const row of rows ?? []) {
      if (!row.image_url) continue;
      const next = rewrite(row.image_url);
      if (next !== row.image_url) {
        await supabase.from(table).update({ image_url: next }).eq("id", row.id);
      }
    }
  }

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("site_name", siteName);

  for (const row of settings ?? []) {
    if (!row.value.includes(`projects/${sourceStorageSlug}/`)) continue;
    const next = rewrite(row.value);
    if (next && next !== row.value) {
      await supabase
        .from("site_settings")
        .update({ value: next })
        .eq("site_name", siteName)
        .eq("key", row.key);
    }
  }
}

/**
 * DB + Storage + URL 재작성 — 독립 사이트 데이터 복제
 */
export async function cloneSiteContent(
  source: ProjectRecord,
  target: ProjectRecord,
): Promise<CloneSiteResult> {
  await cloneProjectContent(source, target);

  const storageResult = await copyProjectStorageAssets(
    source.storage_slug,
    target.storage_slug,
  );

  await rewriteContentImageUrls(
    target.site_name,
    source.storage_slug,
    target.storage_slug,
  );

  return {
    dbCopied: true,
    storageCopied: storageResult.copied,
    storageSkipped: storageResult.skipped,
    storageErrors: storageResult.errors,
  };
}
