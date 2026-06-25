"use client";

import { motion, type Variants } from "framer-motion";
import { ClipboardPen, Phone } from "lucide-react";

const PHONE_DISPLAY = "1844-0148";
const PHONE_TEL = "tel:18440148";
const CONTACT_SECTION_ID = "contact";

const menuEntrance: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const mobileEntrance: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function PhoneButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={PHONE_TEL}
      className={`group flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gold hover:shadow-xl ${className}`}
    >
      <Phone
        size={18}
        className="shrink-0 transition-colors duration-300 group-hover:text-white"
        aria-hidden="true"
      />
      <span className="tracking-wide">{PHONE_DISPLAY}</span>
    </a>
  );
}

function RegisterButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={`#${CONTACT_SECTION_ID}`}
      className={`group flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}
    >
      <ClipboardPen
        size={18}
        className="shrink-0 transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      />
      <span>관심고객 등록</span>
    </a>
  );
}

export default function QuickMenu() {
  return (
    <>
      {/* PC — 오른쪽 중앙 고정 */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={menuEntrance}
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        aria-label="퀵 메뉴"
      >
        <PhoneButton className="min-w-[168px]" />
        <RegisterButton className="min-w-[168px]" />
      </motion.aside>

      {/* 모바일 — 하단 고정 */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={mobileEntrance}
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-white/10 bg-white/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.12)] backdrop-blur-md lg:hidden"
        aria-label="퀵 메뉴"
      >
        <PhoneButton className="flex-1" />
        <RegisterButton className="flex-1" />
      </motion.aside>
    </>
  );
}
