export function isUploadFile(file: unknown): file is File | Blob {
  if (!file || typeof file !== "object") return false;
  if (!("size" in file) || typeof (file as { size: unknown }).size !== "number") {
    return false;
  }
  return (file as { size: number }).size > 0;
}

export function getUploadFileName(file: File | Blob): string {
  if (file instanceof File && file.name) return file.name;
  return "upload.jpg";
}

/** Vercel Serverless 요청 본문 한도(약 4.5MB)에 맞춤 */
export const MAX_UPLOAD_FILE_SIZE = 4 * 1024 * 1024;
