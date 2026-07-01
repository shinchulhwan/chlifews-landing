"use client";

import Image from "next/image";
import { useState } from "react";
import CommunityDetailModal from "@/components/CommunityDetailModal";
import { isLightboxExternalUrl } from "@/lib/lightbox/types";
import { useLiveProjectContent } from "@/lib/project-content/use-live-content";
import type { ProjectCommunityItem } from "@/lib/types/project-content";

type CommunityProps = {
  initialItems: ProjectCommunityItem[];
};

export default function Community({ initialItems }: CommunityProps) {
  const items = useLiveProjectContent<ProjectCommunityItem[]>("community", initialItems);
  const [selectedItem, setSelectedItem] = useState<ProjectCommunityItem | null>(null);

  return (
    <section id="community" className="bg-light-gray py-20">
      <h2 className="sr-only">단지 커뮤니티</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="text-center text-navy/50">단지 커뮤니티 — 구현 예정</div>
        ) : (
          <>
            <div className="mb-12 text-center">
              <h3 className="text-2xl font-bold text-navy sm:text-3xl">단지 커뮤니티</h3>
              <p className="mx-auto mt-4 max-w-2xl text-navy/70">
                입주민을 위한 다양한 프리미엄 커뮤니티 시설을 만나보세요.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="group overflow-hidden rounded-2xl border border-navy/10 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy/5">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        unoptimized={isLightboxExternalUrl(item.image_url)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-navy/40">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-navy transition-colors group-hover:text-gold">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="mt-2 line-clamp-2 text-sm text-navy/70">{item.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <CommunityDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}
