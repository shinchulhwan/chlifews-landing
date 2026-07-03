import { tryCreateServiceRoleClient } from "@/lib/supabase/admin";
import { SITE_ASSETS_BUCKET } from "@/lib/storage/site-assets";

export type StorageCopyResult = {
  copied: number;
  skipped: number;
  errors: string[];
};

/**
 * Supabase Storage — projects/{sourceSlug}/ → projects/{targetSlug}/ 복사
 */
export async function copyProjectStorageAssets(
  sourceStorageSlug: string,
  targetStorageSlug: string,
): Promise<StorageCopyResult> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) {
    return { copied: 0, skipped: 0, errors: ["SUPABASE_SERVICE_ROLE_KEY가 필요합니다."] };
  }

  const sourcePrefix = `projects/${sourceStorageSlug}`;
  const result: StorageCopyResult = { copied: 0, skipped: 0, errors: [] };

  async function listAll(prefix: string): Promise<string[]> {
    const paths: string[] = [];
    if (!supabase) return paths;

    const { data, error } = await supabase.storage.from(SITE_ASSETS_BUCKET).list(prefix, {
      limit: 500,
    });

    if (error) {
      console.warn("[storage-copy:list]", error.message);
      return paths;
    }

    for (const item of data ?? []) {
      const itemPath = `${prefix}/${item.name}`;
      if (item.id === null) {
        paths.push(...(await listAll(itemPath)));
      } else {
        paths.push(itemPath);
      }
    }
    return paths;
  }

  const sourcePaths = await listAll(sourcePrefix);

  for (const sourcePath of sourcePaths) {
    const relative = sourcePath.slice(sourcePrefix.length + 1);
    const targetPath = `projects/${targetStorageSlug}/${relative}`;

    const { error: copyError } = await supabase.storage
      .from(SITE_ASSETS_BUCKET)
      .copy(sourcePath, targetPath);

    if (copyError) {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(SITE_ASSETS_BUCKET)
        .download(sourcePath);

      if (downloadError || !blob) {
        result.skipped += 1;
        result.errors.push(`${sourcePath}: ${copyError.message}`);
        continue;
      }

      const { error: uploadError } = await supabase.storage
        .from(SITE_ASSETS_BUCKET)
        .upload(targetPath, blob, { upsert: true });

      if (uploadError) {
        result.skipped += 1;
        result.errors.push(`${sourcePath}: ${uploadError.message}`);
        continue;
      }
    }

    result.copied += 1;
  }

  return result;
}

export function buildStorageUrlRewritePattern(sourceStorageSlug: string): RegExp {
  return new RegExp(`projects/${escapeRegExp(sourceStorageSlug)}/`, "g");
}

export function rewriteStorageUrl(
  url: string | null | undefined,
  sourceStorageSlug: string,
  targetStorageSlug: string,
): string | null {
  if (!url?.trim()) return url ?? null;
  const pattern = buildStorageUrlRewritePattern(sourceStorageSlug);
  return url.replace(pattern, `projects/${targetStorageSlug}/`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
