"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import MobileFadeSection from "@/components/mobile/MobileFadeSection";
import MobileSectionTitle from "@/components/mobile/MobileSectionTitle";
import MobileSwiper from "@/components/mobile/MobileSwiper";
import { resolveLocationIcon } from "@/lib/project-content/icons";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import {
  cacheBustFromUpdatedAt,
  withImageCacheBust,
} from "@/lib/images/display-url";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectLocation } from "@/lib/types/project-content";

type LocationProps = {
  initialData: ProjectLocation | null;
};

export default function Location({ initialData }: LocationProps) {
  const data = useLiveProjectContent<ProjectLocation | null>("location", initialData);
  const sectionTitle = data?.section_title ?? "입지환경";
  const mainImageUrl = withImageCacheBust(
    data?.main_image_url,
    cacheBustFromUpdatedAt(data?.updated_at),
  );
  const points = data?.points ?? [];
  const hasContent = Boolean(mainImageUrl) || points.length > 0;

  const lightboxItems: LightboxItem[] = useMemo(
    () => (mainImageUrl ? [{ src: mainImageUrl, alt: sectionTitle }] : []),
    [mainImageUrl, sectionTitle],
  );

  return (
    <section
      id="location"
      className="bg-light-gray py-20 max-md:max-w-full max-md:overflow-x-hidden"
    >
      <h2 className="sr-only">{sectionTitle}</h2>

      {/* Mobile — 지도 + 주변시설 (세로 배치, 가로 스크롤 방지) */}
      <div className="max-w-full min-w-0 overflow-x-hidden md:hidden">
        {!hasContent ? (
          <div className="px-5 text-center text-[15px] leading-[1.7] break-keep break-words text-navy/50">
            Location — 구현 예정
          </div>
        ) : (
          <MobileFadeSection className="max-w-full min-w-0 overflow-x-hidden">
            <MobileSectionTitle title={sectionTitle} className="px-5" />
            <div className="flex max-w-full min-w-0 flex-col gap-10 overflow-x-hidden px-5">
              {mainImageUrl && (
                <div className="location-mobile-map w-full max-w-full min-w-0 overflow-hidden rounded-[20px] bg-white shadow-sm">
                  <LightboxTrigger
                    items={lightboxItems}
                    index={0}
                    className="block w-full max-w-full"
                  >
                    <Image
                      src={mainImageUrl}
                      alt={sectionTitle}
                      width={1200}
                      height={900}
                      unoptimized={isLightboxExternalUrl(mainImageUrl)}
                      className="h-auto w-full max-w-full object-cover"
                      sizes="100vw"
                    />
                  </LightboxTrigger>
                </div>
              )}
              {points.length > 0 && (
                <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden">
                  <p className="mb-4 text-center text-[15px] font-medium break-keep break-words text-navy/60">
                    주변 시설
                  </p>
                  <MobileSwiper className="location-points-swiper">
                    {points.map((point) => {
                      const Icon = resolveLocationIcon(point.icon);
                      return (
                        <div
                          key={point.id}
                          className="box-border flex w-full max-w-full min-w-0 flex-col items-center justify-center rounded-[20px] border border-navy/10 bg-white px-5 py-10 text-center shadow-sm"
                        >
                          <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold/10">
                            <Icon className="text-gold" size={40} strokeWidth={1.5} />
                          </div>
                          <h4 className="w-full max-w-full text-[32px] font-bold leading-[1.3] break-keep break-words text-navy">
                            {point.title}
                          </h4>
                          {point.description && (
                            <p className="mt-4 line-clamp-2 w-full max-w-full text-base leading-[1.7] break-keep break-words text-navy/70">
                              {point.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </MobileSwiper>
                </div>
              )}
            </div>
          </MobileFadeSection>
        )}
      </div>

      {/* Desktop — 기존 레이아웃 유지 */}
      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 md:block lg:px-8">
        {!hasContent ? (
          <div className="text-center text-navy/50">Location — 구현 예정</div>
        ) : (
          <>
            <h3 className="mb-10 text-center text-2xl font-bold text-navy sm:text-3xl">
              {sectionTitle}
            </h3>
            <div className="grid items-start gap-10 lg:grid-cols-2">
              {mainImageUrl && (
                <LightboxTrigger
                  items={lightboxItems}
                  index={0}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <Image
                    src={mainImageUrl}
                    alt={sectionTitle}
                    fill
                    unoptimized={isLightboxExternalUrl(mainImageUrl)}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </LightboxTrigger>
              )}
              {points.length > 0 && (
                <div className="space-y-4">
                  {points.map((point) => {
                    const Icon = resolveLocationIcon(point.icon);
                    return (
                      <div
                        key={point.id}
                        className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                          <Icon className="text-gold" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy">{point.title}</h4>
                          {point.description && (
                            <p className="mt-1 whitespace-pre-line text-sm text-navy/70">
                              {point.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
