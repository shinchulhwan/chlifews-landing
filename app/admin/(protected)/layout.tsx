import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!await isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  return children;
}
