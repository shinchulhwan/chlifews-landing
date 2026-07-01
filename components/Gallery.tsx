"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectGalleryItem } from "@/lib/types/project-content";

type GalleryProps = {
  initialItems: ProjectGalleryItem[];
};

export default function Gallery({ initialItems }: GalleryProps) {
  const items = useLiveProjectContent<ProjectGalleryItem[]>("gallery", initialItems);
  const featured = items.find((item) => item.is_featured) ?? items[0];
  const rest = items.filter((item) => item.id !== featured?.id);

  const lightboxItems: LightboxItem[] = useMemo(() => {
    const featuredItem = items.find((item) => item.is_featured) ?? items[0];
    const restItems = items.filter((item) => item.id !== featuredItem?.id);
    const ordered = featuredItem ? [featuredItem, ...restItems] : restItems;
    return ordered.map((item) => ({
      src: item.image_url,
      alt: item.title || "갤러리 이미지",
    }));
  }, [items]);

  return (
    <section id="gallery" className="bg-white py-20">
      <h2 className="sr-only">갤러리</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="text-center text-navy/50">Gallery — 구현 예정</div>
        ) : (
          <>
            <h3 className="mb-10 text-center text-2xl font-bold text-navy sm:text-3xl">갤러리</h3>
            {featured && (
              <LightboxTrigger
                items={lightboxItems}
                index={0}
                className="relative mb-6 block aspect-[21/9] overflow-hidden rounded-2xl bg-light-gray"
              >
                <Image
                  src={featured.image_url}
                  alt={featured.title || "대표 이미지"}
                  fill
                  unoptimized={isLightboxExternalUrl(featured.image_url)}
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </LightboxTrigger>
            )}
            {rest.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item, idx) => (
                  <LightboxTrigger
                    key={item.id}
                    items={lightboxItems}
                    index={featured ? idx + 1 : idx}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-light-gray"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.title || "갤러리 이미지"}
                      fill
                      unoptimized={isLightboxExternalUrl(item.image_url)}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </LightboxTrigger>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
