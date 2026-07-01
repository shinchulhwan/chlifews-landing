import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!await isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
