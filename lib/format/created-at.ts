/**
 * customers.created_at 표시 포맷 (YYYY.MM.DD HH:mm)
 */
const MIN_VALID_YEAR = 2000;

export function formatCreatedAt(value: unknown): string {
  const normalized = normalizeCreatedAt(value);
  if (!normalized) {
    return "-";
  }

  const date = parseCreatedAt(normalized);
  if (!date || !isValidCreatedAt(date)) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

/** Supabase에서 읽은 created_at을 string | null로 정규화 */
export function normalizeCreatedAt(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime()) || !isValidCreatedAt(value)) {
      return null;
    }
    return value.toISOString();
  }

  if (typeof value === "number") {
    if (value === 0) {
      return null;
    }
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime()) || !isValidCreatedAt(date)) {
      return null;
    }
    return date.toISOString();
  }

  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "null" || trimmed === "0") {
    return null;
  }

  return trimmed;
}

function parseCreatedAt(value: string): Date | null {
  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric !== 0) {
    const ms = numeric < 1e12 ? numeric * 1000 : numeric;
    const numericDate = new Date(ms);
    if (!Number.isNaN(numericDate.getTime())) {
      return numericDate;
    }
  }

  return null;
}

function isValidCreatedAt(date: Date): boolean {
  return date.getFullYear() >= MIN_VALID_YEAR;
}
