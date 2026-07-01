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

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;
