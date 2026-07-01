"use client";

import { Children, type CSSProperties, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";

const SWIPER_EASE = [0.22, 1, 0.36, 1] as const;

type MobileSwiperProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
  options?: SwiperOptions;
  style?: CSSProperties;
};

export default function MobileSwiper({
  children,
  className = "",
  slideClassName = "",
  options = {},
  style,
}: MobileSwiperProps) {
  const slides = Children.toArray(children);

  return (
    <Swiper
      modules={[Pagination, A11y]}
      slidesPerView={1}
      spaceBetween={16}
      speed={500}
      pagination={{ clickable: true, dynamicBullets: true }}
      className={`mobile-swiper pb-10 ${className}`}
      style={
        {
          "--swiper-theme-color": "#c9a96e",
          "--swiper-pagination-bullet-inactive-opacity": "0.35",
          ...style,
        } as CSSProperties
      }
      {...options}
      onSlideChangeTransitionStart={(swiper) => {
        swiper.wrapperEl.style.transitionTimingFunction = `cubic-bezier(${SWIPER_EASE.join(",")})`;
      }}
    >
      {slides.map((child, index) => (
        <SwiperSlide key={index} className={slideClassName}>
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
