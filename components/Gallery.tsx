"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import MobileFadeSection from "@/components/mobile/MobileFadeSection";
import MobileSectionTitle from "@/components/mobile/MobileSectionTitle";
import MobileSwiper from "@/components/mobile/MobileSwiper";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import {
  cacheBustFromUpdatedAt,
  withImageCacheBust,
} from "@/lib/images/display-url";
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
      src:
        withImageCacheBust(
          item.image_url,
          cacheBustFromUpdatedAt(item.updated_at),
        ) ?? item.image_url,
      alt: item.title || "갤러리 이미지",
    }));
  }, [items]);

  const displayUrl = (item: ProjectGalleryItem) =>
    withImageCacheBust(item.image_url, cacheBustFromUpdatedAt(item.updated_at)) ??
    item.image_url;

  const orderedItems = featured ? [featured, ...rest] : items;

  return (
    <section id="gallery" className="bg-white py-20">
      <h2 className="sr-only">갤러리</h2>

      {/* Mobile — 전체 폭 갤러리 슬라이드 */}
      <div className="md:hidden">
        {items.length === 0 ? (
          <div className="px-6 text-center text-[15px] leading-[1.7] text-navy/50">
            Gallery — 구현 예정
          </div>
        ) : (
          <MobileFadeSection>
            <MobileSectionTitle title="갤러리" />
            <MobileSwiper className="!px-0" options={{ spaceBetween: 0 }}>
              {orderedItems.map((item, idx) => (
                <LightboxTrigger
                  key={item.id}
                  items={lightboxItems}
                  index={idx}
                  className="relative block aspect-[4/3] w-full bg-light-gray"
                >
                  <Image
                    src={displayUrl(item)}
                    alt={item.title || "갤러리 이미지"}
                    fill
                    unoptimized={isLightboxExternalUrl(displayUrl(item))}
                    className="object-cover"
                    sizes="100vw"
                    priority={idx === 0}
                  />
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-6 py-6">
                      <p className="text-base font-medium text-white">{item.title}</p>
                    </div>
                  )}
                </LightboxTrigger>
              ))}
            </MobileSwiper>
          </MobileFadeSection>
        )}
      </div>

      {/* Desktop — 기존 레이아웃 유지 */}
      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 md:block lg:px-8">
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
                  src={displayUrl(featured)}
                  alt={featured.title || "대표 이미지"}
                  fill
                  unoptimized={isLightboxExternalUrl(displayUrl(featured))}
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
                      src={displayUrl(item)}
                      alt={item.title || "갤러리 이미지"}
                      fill
                      unoptimized={isLightboxExternalUrl(displayUrl(item))}
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
