"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { ReactNode } from "react";

type MobileFadeSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function MobileFadeSection({
  children,
  className = "",
  delay = 0,
}: MobileFadeSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
