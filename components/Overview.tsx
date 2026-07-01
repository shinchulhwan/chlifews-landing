"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import {
  cacheBustFromUpdatedAt,
  withImageCacheBust,
} from "@/lib/images/display-url";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectOverview } from "@/lib/types/project-content";

type OverviewProps = {
  initialData: ProjectOverview | null;
};

export default function Overview({ initialData }: OverviewProps) {
  const data = useLiveProjectContent<ProjectOverview | null>("overview", initialData);

  const sectionTitle = data?.section_title ?? "사업개요";
  const description = data?.description ?? "";
  const infoCards = data?.info_cards ?? [];
  const imageUrl = withImageCacheBust(
    data?.image_url,
    cacheBustFromUpdatedAt(data?.updated_at),
  );
  const hasContent =
    Boolean(description) || Boolean(imageUrl) || infoCards.some((card) => card.value);

  const lightboxItems: LightboxItem[] = useMemo(
    () => (imageUrl ? [{ src: imageUrl, alt: sectionTitle }] : []),
    [imageUrl, sectionTitle],
  );

  return (
    <section id="overview" className="bg-light-gray py-20">
      <h2 className="sr-only">{sectionTitle}</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!hasContent ? (
          <div className="text-center text-navy/50">Project Overview — 구현 예정</div>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {imageUrl && (
              <LightboxTrigger
                items={lightboxItems}
                index={0}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <Image
                  src={imageUrl}
                  alt={sectionTitle}
                  fill
                  unoptimized={isLightboxExternalUrl(imageUrl)}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </LightboxTrigger>
            )}
            <div>
              <h3 className="mb-4 text-2xl font-bold text-navy sm:text-3xl">{sectionTitle}</h3>
              {description && (
                <p
                  dir="ltr"
                  className="mb-8 whitespace-pre-line text-navy/70 leading-relaxed [unicode-bidi:plaintext]"
                >
                  {description}
                </p>
              )}
              {infoCards.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {infoCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-xl border border-navy/10 bg-white px-4 py-3"
                    >
                      <p className="text-xs font-semibold text-gold">{card.label}</p>
                      <p
                        dir="ltr"
                        className="mt-1 text-sm font-medium text-navy [unicode-bidi:plaintext]"
                      >
                        {card.value || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
