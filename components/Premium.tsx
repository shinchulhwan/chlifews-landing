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
import type { ProjectPremiumData } from "@/lib/types/project-content";

type PremiumProps = {
  initialData: ProjectPremiumData;
};

export default function Premium({ initialData }: PremiumProps) {
  const data = useLiveProjectContent<ProjectPremiumData>("premium", initialData);
  const sectionTitle = data.section.section_title || "프리미엄 / 미래가치";
  const sectionDescription = data.section.section_description;
  const cards = data.cards;
  const hasContent = Boolean(sectionDescription) || cards.length > 0;

  const { lightboxItems, imageIndexById } = useMemo(() => {
    const lb: LightboxItem[] = [];
    const map = new Map<string, number>();
    cards.forEach((card) => {
      const src = withImageCacheBust(
        card.image_url,
        cacheBustFromUpdatedAt(card.updated_at),
      );
      if (src) {
        map.set(card.id, lb.length);
        lb.push({ src, alt: card.title || "프리미엄" });
      }
    });
    return { lightboxItems: lb, imageIndexById: map };
  }, [cards]);

  return (
    <section id="premium" className="bg-white py-20">
      <h2 className="sr-only">{sectionTitle}</h2>

      {/* Mobile — 카드 한 장씩 */}
      <div className="md:hidden">
        {!hasContent ? (
          <div className="px-6 text-center text-[15px] leading-[1.7] text-navy/50">
            Premium Point — 구현 예정
          </div>
        ) : (
          <MobileFadeSection>
            <MobileSectionTitle
              title={sectionTitle}
              description={sectionDescription || undefined}
            />
            {cards.length > 0 && (
              <div className="px-6">
                <MobileSwiper>
                  {cards.map((card) => {
                    const cardImage = withImageCacheBust(
                      card.image_url,
                      cacheBustFromUpdatedAt(card.updated_at),
                    );
                    return (
                      <div
                        key={card.id}
                        className="flex min-h-[min(72vh,540px)] flex-col overflow-hidden rounded-[20px] border border-navy/10 bg-light-gray/40"
                      >
                        {cardImage ? (
                          <LightboxTrigger
                            items={lightboxItems}
                            index={imageIndexById.get(card.id) ?? 0}
                            className="relative aspect-square w-full bg-navy/5"
                          >
                            <Image
                              src={cardImage}
                              alt={card.title}
                              fill
                              unoptimized={isLightboxExternalUrl(cardImage)}
                              className="object-cover"
                              sizes="100vw"
                            />
                          </LightboxTrigger>
                        ) : (
                          <div className="flex aspect-square items-center justify-center bg-gold/10">
                            <span className="text-5xl font-bold text-gold">
                              {card.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-1 flex-col justify-center px-6 py-8 text-center">
                          <h4 className="text-[32px] font-bold leading-[1.3] text-navy">
                            {card.title}
                          </h4>
                          {card.description && (
                            <p className="mt-4 line-clamp-2 text-base leading-[1.7] text-navy/70">
                              {card.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </MobileSwiper>
              </div>
            )}
          </MobileFadeSection>
        )}
      </div>

      {/* Desktop — 기존 레이아웃 유지 */}
      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 md:block lg:px-8">
        {!hasContent ? (
          <div className="text-center text-navy/50">Premium Point — 구현 예정</div>
        ) : (
          <>
            <div className="mb-12 text-center">
              <h3 className="text-2xl font-bold text-navy sm:text-3xl">{sectionTitle}</h3>
              {sectionDescription && (
                <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-navy/70">
                  {sectionDescription}
                </p>
              )}
            </div>
            {cards.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => {
                  const cardImage = withImageCacheBust(
                    card.image_url,
                    cacheBustFromUpdatedAt(card.updated_at),
                  );
                  return (
                    <article
                      key={card.id}
                      className="overflow-hidden rounded-2xl border border-navy/10 bg-light-gray/40"
                    >
                      {cardImage && (
                        <LightboxTrigger
                          items={lightboxItems}
                          index={imageIndexById.get(card.id) ?? 0}
                          className="relative aspect-[4/3] bg-navy/5"
                        >
                          <Image
                            src={cardImage}
                            alt={card.title}
                            fill
                            unoptimized={isLightboxExternalUrl(cardImage)}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </LightboxTrigger>
                      )}
                      <div className="p-5">
                        <h4 className="text-lg font-semibold text-navy">{card.title}</h4>
                        {card.description && (
                          <p className="mt-2 whitespace-pre-line text-sm text-navy/70">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
