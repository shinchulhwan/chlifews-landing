"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
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
    <section id="location" className="bg-light-gray py-20">
      <h2 className="sr-only">{sectionTitle}</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
