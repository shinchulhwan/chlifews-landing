"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitInterestCustomer } from "@/lib/actions/interest";
import { fadeUp } from "@/lib/animations";
import {
  validateCustomer,
  type CustomerErrors,
  type CustomerField,
} from "@/lib/validations/customer";

const inputBase =
  "w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:ring-2";

function getInputClass(error?: string) {
  return error
    ? `${inputBase} border-red-400/60 focus:border-red-400/60 focus:ring-red-400/20`
    : `${inputBase} border-white/10 focus:border-gold/60 focus:ring-gold/20`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-300" role="alert">
      {message}
    </p>
  );
}

export default function ContactForm() {
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: CustomerField) {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    const clientValidation = validateCustomer({
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      memo: String(formData.get("memo") ?? ""),
    });

    if (!clientValidation.success) {
      setErrors(clientValidation.errors);
      const firstError =
        Object.values(clientValidation.errors)[0] ?? "입력값을 확인해 주세요.";
      setStatus({ type: "error", message: firstError });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await submitInterestCustomer(formData);

    if (result.success) {
      setStatus({ type: "success", message: result.message });
      form.reset();
    } else {
      setErrors(result.errors ?? {});
      setStatus({ type: "error", message: result.message });
    }

    setIsSubmitting(false);
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={0.2}
      variants={fadeUp}
      className="mx-auto max-w-xl"
    >
      {status.type === "success" && (
        <div
          className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-4"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} />
          <p className="text-sm leading-relaxed text-white/90">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-white/80">
                이름 <span className="text-gold">*</span>
              </span>
              <input
                type="text"
                name="name"
                placeholder="홍길동"
                autoComplete="name"
                className={getInputClass(errors.name)}
                onChange={() => clearFieldError("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </label>
            <FieldError message={errors.name} />
          </div>

          <div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-white/80">
                연락처 <span className="text-gold">*</span>
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="010-1234-5678"
                autoComplete="tel"
                className={getInputClass(errors.phone)}
                onChange={() => clearFieldError("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </label>
            <FieldError message={errors.phone} />
          </div>
        </div>

        <div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">
              문의내용
            </span>
            <textarea
              name="memo"
              rows={4}
              maxLength={500}
              placeholder="궁금한 점이나 요청 사항을 남겨주세요. (최대 500자)"
              className={`${getInputClass(errors.memo)} resize-none`}
              onChange={() => clearFieldError("memo")}
              aria-invalid={Boolean(errors.memo)}
            />
          </label>
          <FieldError message={errors.memo} />
        </div>

        {status.type === "error" && (
          <p className="text-sm text-red-300" role="alert">
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gold/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              관심고객 등록
              <Send
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
