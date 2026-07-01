"use client";

import Link from "next/link";
import { ClipboardPen, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact-links";

type MobileContactActionsProps = {
  phone?: string;
};

export default function MobileContactActions({
  phone = PHONE_DISPLAY,
}: MobileContactActionsProps) {
  const digits = phone.replace(/[^0-9]/g, "");
  const tel = digits ? `tel:${digits}` : PHONE_TEL;

  return (
    <div className="mb-10 flex flex-col gap-3 px-6">
      <a
        href={tel}
        className="flex min-h-[56px] items-center justify-center gap-3 rounded-[20px] bg-white px-6 text-base font-semibold text-navy shadow-lg transition-transform active:scale-[0.98]"
      >
        <Phone size={22} className="text-gold" aria-hidden="true" />
        전화 상담 {phone}
      </a>
      <Link
        href="#contact-form"
        className="flex min-h-[56px] items-center justify-center gap-3 rounded-[20px] bg-gold px-6 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
      >
        <ClipboardPen size={22} aria-hidden="true" />
        관심고객 상담신청
      </Link>
    </div>
  );
}
