import { cookies } from "next/headers";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "@/lib/auth/admin-constants";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_COOKIE_VALUE = "authenticated";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24;

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  return (
    username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD
  );
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
