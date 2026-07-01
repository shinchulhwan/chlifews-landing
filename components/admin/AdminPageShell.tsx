"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminLogout } from "@/lib/actions/admin";

type AdminPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function useAdminToast() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, setToast };
}

export function AdminToast({
  toast,
}: {
  toast: { type: "success" | "error"; message: string } | null;
}) {
  if (!toast) return null;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        toast.type === "success"
          ? "border-gold/30 bg-gold/10 text-navy"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
      role="status"
    >
      {toast.type === "success" && (
        <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={18} />
      )}
      {toast.message}
    </div>
  );
}

export default function AdminPageShell({
  title,
  description,
  children,
}: AdminPageShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-[0.2em] text-gold uppercase">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-navy/60">{description}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

export const adminInputClass =
  "w-full min-w-0 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-gold/50";

export const adminTextareaClass =
  `${adminInputClass} min-h-[200px] resize-y`;

export const adminLabelClass = "mb-1.5 block text-xs font-semibold text-navy/70";

export const adminCardClass =
  "rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-6";

export const adminPrimaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-50";

export const adminSecondaryButtonClass =
  "rounded-xl border border-navy/10 px-5 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray disabled:opacity-50";

export const adminDangerButtonClass =
  "rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50";

export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
