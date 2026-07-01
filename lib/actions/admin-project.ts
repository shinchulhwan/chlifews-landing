"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_PROJECT_COOKIE } from "@/lib/admin/project-context";

export async function setActiveProjectSlug(slug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_PROJECT_COOKIE, slug, {
    path: "/admin",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/admin", "layout");
}
