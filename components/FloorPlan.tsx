"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LightboxTrigger } from "@/components/lightbox";
import type { LightboxItem } from "@/lib/lightbox/types";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectFloorplan } from "@/lib/types/project-content";

type FloorPlanProps = {
  initialItems: ProjectFloorplan[];
};

export default function FloorPlan({ initialItems }: FloorPlanProps) {
  const items = useLiveProjectContent<ProjectFloorplan[]>("floorplans", initialItems);

  const { lightboxItems, imageIndexById } = useMemo(() => {
    const lb: LightboxItem[] = [];
    const map = new Map<string, number>();
    items.forEach((item) => {
      if (item.image_url) {
        map.set(item.id, lb.length);
        lb.push({ src: item.image_url, alt: item.type_name || "평면도" });
      }
    });
    return { lightboxItems: lb, imageIndexById: map };
  }, [items]);

  return (
    <section id="floorplan" className="bg-light-gray py-20">
      <h2 className="sr-only">평면도</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="text-center text-navy/50">Floor Plan — 구현 예정</div>
        ) : (
          <>
            <h3 className="mb-10 text-center text-2xl font-bold text-navy sm:text-3xl">평면도</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-navy/10 bg-white"
                >
                  {item.image_url && (
                    <LightboxTrigger
                      items={lightboxItems}
                      index={imageIndexById.get(item.id) ?? 0}
                      className="relative block aspect-[4/3] bg-light-gray"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.type_name}
                        fill
                        unoptimized={isLightboxExternalUrl(item.image_url)}
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
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
