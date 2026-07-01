"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import {
  cacheBustFromUpdatedAt,
  withImageCacheBust,
} from "@/lib/images/display-url";
import type { ProjectCommunityItem } from "@/lib/types/project-content";

type CommunityDetailModalProps = {
  item: ProjectCommunityItem | null;
  onClose: () => void;
};

export default function CommunityDetailModal({
  item,
  onClose,
}: CommunityDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!mounted || !item) return null;

  const itemImage = withImageCacheBust(
    item.image_url,
    cacheBustFromUpdatedAt(item.updated_at),
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-modal-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        {itemImage && (
          <div className="relative aspect-[16/10] w-full bg-navy/5">
            <Image
              src={itemImage}
              alt={item.title}
              fill
              unoptimized={isLightboxExternalUrl(itemImage)}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h3 id="community-modal-title" className="text-xl font-bold text-navy sm:text-2xl">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="mt-2 text-sm font-medium text-gold sm:text-base">{item.subtitle}</p>
          )}
          {item.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-navy/70 sm:text-base">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
