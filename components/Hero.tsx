"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { HERO_IMAGE_ALT, SITE_BRAND } from "@/lib/seo/site";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt={HERO_IMAGE_ALT}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-navy/20"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="mb-4 text-sm font-medium tracking-[0.2em] text-gold uppercase sm:text-base"
          >
            Premium Urban Living
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {SITE_BRAND}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="mb-4 max-w-xl text-lg font-medium text-white/95 sm:text-xl md:text-2xl"
          >
            도심의 중심, 새로운 주거의 기준
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeUp}
            className="mb-10 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base"
          >
            탁 트인 스카이라인과 프리미엄 커뮤니티 시설이 조화를 이루는
            Aurora Residence. 당신의 일상을 한층 더 품격 있게 완성합니다.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.4}
            variants={fadeUp}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gold/90 hover:shadow-lg sm:text-base"
            >
              상담 신청하기
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#overview"
              className="group inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/20 sm:text-base"
            >
              프로젝트 소개
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.a
          href="#overview"
          aria-label="다음 섹션으로 스크롤"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-gold"
        >
          <span className="text-xs font-medium tracking-widest uppercase">
            Scroll
          </span>
          <ArrowDown size={20} />
        </motion.a>
      </motion.div>
    </section>
  );
}
