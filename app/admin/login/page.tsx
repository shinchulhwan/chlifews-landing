import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export const metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-light-gray px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy shadow-lg">
            <Lock className="text-gold" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-navy">관리자 로그인</h1>
          <p className="mt-2 text-sm text-navy/60">
            관리자 계정으로 로그인해 주세요.
          </p>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-lg">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
