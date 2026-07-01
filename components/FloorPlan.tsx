"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination, Zoom } from "swiper/modules";
import { LightboxTrigger } from "@/components/lightbox";
import MobileFadeSection from "@/components/mobile/MobileFadeSection";
import MobileSectionTitle from "@/components/mobile/MobileSectionTitle";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import {
  cacheBustFromUpdatedAt,
  withImageCacheBust,
} from "@/lib/images/display-url";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectFloorplan } from "@/lib/types/project-content";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/zoom";

type FloorPlanProps = {
  initialItems: ProjectFloorplan[];
};

export default function FloorPlan({ initialItems }: FloorPlanProps) {
  const items = useLiveProjectContent<ProjectFloorplan[]>("floorplans", initialItems);

  const { lightboxItems, imageIndexById } = useMemo(() => {
    const lb: LightboxItem[] = [];
    const map = new Map<string, number>();
    items.forEach((item) => {
      const src = withImageCacheBust(
        item.image_url,
        cacheBustFromUpdatedAt(item.updated_at),
      );
      if (src) {
        map.set(item.id, lb.length);
        lb.push({ src, alt: item.type_name || "평면도" });
      }
    });
    return { lightboxItems: lb, imageIndexById: map };
  }, [items]);

  return (
    <section id="floorplan" className="bg-light-gray py-20">
      <h2 className="sr-only">평면도</h2>

      {/* Mobile — 한 장씩 크게 + 핀치줌 */}
      <div className="md:hidden">
        {items.length === 0 ? (
          <div className="px-6 text-center text-[15px] leading-[1.7] text-navy/50">
            Floor Plan — 구현 예정
          </div>
        ) : (
          <MobileFadeSection>
            <MobileSectionTitle title="평면도" />
            <div className="px-6">
              <Swiper
                modules={[Pagination, Zoom, A11y]}
                slidesPerView={1}
                spaceBetween={16}
                speed={500}
                zoom={{ maxRatio: 3 }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="mobile-swiper floorplan-swiper pb-10"
                style={
                  {
                    "--swiper-theme-color": "#c9a96e",
                    "--swiper-pagination-bullet-inactive-opacity": "0.35",
                  } as React.CSSProperties
                }
              >
                {items.map((item) => {
                  const itemImage = withImageCacheBust(
                    item.image_url,
                    cacheBustFromUpdatedAt(item.updated_at),
                  );
                  return (
                    <SwiperSlide key={item.id}>
                      <article className="overflow-hidden rounded-[20px] border border-navy/10 bg-white shadow-sm">
                        {itemImage && (
                          <LightboxTrigger
                            items={lightboxItems}
                            index={imageIndexById.get(item.id) ?? 0}
                            className="relative block"
                          >
                            <div className="swiper-zoom-container relative aspect-[4/3] bg-light-gray">
                              <Image
                                src={itemImage}
                                alt={item.type_name}
                                fill
                                unoptimized={isLightboxExternalUrl(itemImage)}
                                className="object-contain p-4"
                                sizes="100vw"
                              />
                            </div>
                            <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-navy/50">
                              탭하여 전체화면 · 핀치로 확대
                            </p>
                          </LightboxTrigger>
                        )}
                        <div className="border-t border-navy/10 px-6 py-5 text-center">
                          <h4 className="text-[32px] font-bold leading-[1.3] text-navy">
                            {item.type_name}
                          </h4>
                          <div className="mt-2 flex flex-wrap justify-center gap-3 text-base leading-[1.7] text-navy/70">
                            {item.supply_area && <span>공급 {item.supply_area}</span>}
                            {item.exclusive_area && <span>전용 {item.exclusive_area}</span>}
                          </div>
                        </div>
                      </article>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </MobileFadeSection>
        )}
      </div>

      {/* Desktop — 기존 레이아웃 유지 */}
      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 md:block lg:px-8">
        {items.length === 0 ? (
          <div className="text-center text-navy/50">Floor Plan — 구현 예정</div>
        ) : (
          <>
            <h3 className="mb-10 text-center text-2xl font-bold text-navy sm:text-3xl">평면도</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const itemImage = withImageCacheBust(
                  item.image_url,
                  cacheBustFromUpdatedAt(item.updated_at),
                );
                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-navy/10 bg-white"
                  >
                    {itemImage && (
                      <LightboxTrigger
                        items={lightboxItems}
                        index={imageIndexById.get(item.id) ?? 0}
                        className="relative block aspect-[4/3] bg-light-gray"
                      >
                        <Image
                          src={itemImage}
                          alt={item.type_name}
                          fill
                          unoptimized={isLightboxExternalUrl(itemImage)}
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </LightboxTrigger>
                    )}
                    <div className="border-t border-navy/10 p-5">
                      <h4 className="text-lg font-bold text-navy">{item.type_name}</h4>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-navy/70">
                        {item.supply_area && <span>공급 {item.supply_area}</span>}
                        {item.exclusive_area && <span>전용 {item.exclusive_area}</span>}
                      </div>
                      {item.description && (
                        <p className="mt-3 whitespace-pre-line text-sm text-navy/60">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
