"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { adminLogin } from "@/lib/actions/admin";
import { ADMIN_LOGIN_ERROR } from "@/lib/auth/admin-constants";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await adminLogin(username, password);

    if (result.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.message || ADMIN_LOGIN_ERROR);
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy/80">
          아이디
        </label>
        <div className="relative">
          <User
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="chlifews"
            autoComplete="username"
            required
            className="w-full rounded-2xl border border-navy/10 bg-light-gray py-3 pl-11 pr-4 text-sm text-navy outline-none transition-colors focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy/80">
          비밀번호
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-navy/10 bg-light-gray py-3 pl-11 pr-4 text-sm text-navy outline-none transition-colors focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      {error && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-navy/90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            로그인 중...
          </>
        ) : (
          <>
            <Lock size={18} />
            로그인
          </>
        )}
      </button>
    </form>
  );
}
