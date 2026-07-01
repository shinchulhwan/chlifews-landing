"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
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
      if (card.image_url) {
        map.set(card.id, lb.length);
        lb.push({ src: card.image_url, alt: card.title || "프리미엄" });
      }
    });
    return { lightboxItems: lb, imageIndexById: map };
  }, [cards]);

  return (
    <section id="premium" className="bg-white py-20">
      <h2 className="sr-only">{sectionTitle}</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                {cards.map((card) => (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-2xl border border-navy/10 bg-light-gray/40"
                  >
                    {card.image_url && (
                      <LightboxTrigger
                        items={lightboxItems}
                        index={imageIndexById.get(card.id) ?? 0}
                        className="relative aspect-[4/3] bg-navy/5"
                      >
                        <Image
                          src={card.image_url}
                          alt={card.title}
                          fill
                          unoptimized={isLightboxExternalUrl(card.image_url)}
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
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
