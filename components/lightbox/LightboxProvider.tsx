"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LightboxItem } from "@/lib/lightbox/types";

type LightboxContextValue = {
  open: (items: LightboxItem[], startIndex?: number) => void;
  close: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within LightboxProvider");
  }
  return ctx;
}

type LightboxProviderProps = {
  children: ReactNode;
};

export function LightboxProvider({ children }: LightboxProviderProps) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = useCallback((nextItems: LightboxItem[], startIndex = 0) => {
    if (nextItems.length === 0) return;
    setItems(nextItems);
    setIndex(Math.min(Math.max(startIndex, 0), nextItems.length - 1));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {mounted && isOpen && items.length > 0 && (
        <LightboxOverlay
          items={items}
          index={index}
          setIndex={setIndex}
          onClose={close}
        />
      )}
    </LightboxContext.Provider>
  );
}

type LightboxOverlayProps = {
  items: LightboxItem[];
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
};

function LightboxOverlay({ items, index, setIndex, onClose }: LightboxOverlayProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastTapTime = useRef(0);
  const pinchStartDistance = useRef(0);
  const pinchStartScale = useRef(1);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const resetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [index, resetZoom]);

  useEffect(() => {
    if (!current) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (scale > 1) return;
      if (event.key === "ArrowLeft" && index > 0) {
        setIndex((i) => i - 1);
      }
      if (event.key === "ArrowRight" && index < items.length - 1) {
        setIndex((i) => i + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [current, index, items.length, onClose, scale, setIndex]);

  function goPrev() {
    if (!hasPrev) return;
    setIndex((i) => i - 1);
  }

  function goNext() {
    if (!hasNext) return;
    setIndex((i) => i + 1);
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function getTouchDistance(touches: React.TouchList | TouchList): number {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      pinchStartDistance.current = getTouchDistance(event.touches);
      pinchStartScale.current = scale;
      return;
    }
    if (event.touches.length === 1 && scale === 1) {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length === 2 && pinchStartDistance.current > 0) {
      event.preventDefault();
      const distance = getTouchDistance(event.touches);
      const nextScale = Math.min(
        4,
        Math.max(1, pinchStartScale.current * (distance / pinchStartDistance.current)),
      );
      setScale(nextScale);
      if (nextScale === 1) {
        setPan({ x: 0, y: 0 });
      }
    }
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (event.touches.length > 0) return;

    if (pinchStartDistance.current > 0) {
      pinchStartDistance.current = 0;
      if (scale < 1.05) resetZoom();
      return;
    }

    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2);
      }
      lastTapTime.current = 0;
      return;
    }
    lastTapTime.current = now;

    if (scale > 1) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) goPrev();
      else goNext();
    }
  }

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대 보기"
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
        aria-label="닫기"
      >
        <X size={24} />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            disabled={!hasPrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 disabled:opacity-30 sm:left-4 sm:p-3"
            aria-label="이전 이미지"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            disabled={!hasNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 disabled:opacity-30 sm:right-4 sm:p-3"
            aria-label="다음 이미지"
          >
            <ChevronRight size={28} />
          </button>
          <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white/90">
            {index + 1} / {items.length}
          </p>
        </>
      )}

      <div
        className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        style={{ touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          draggable={false}
          className="max-h-[90vh] max-w-[90vw] select-none object-contain transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

type LightboxTriggerProps = {
  items: LightboxItem[];
  index?: number;
  children: ReactNode;
  className?: string;
};

/** 기존 레이아웃을 유지한 채 클릭 시 Lightbox 오픈 */
export function LightboxTrigger({
  items,
  index = 0,
  children,
  className = "",
}: LightboxTriggerProps) {
  const { open } = useLightbox();

  if (items.length === 0) {
    return <>{children}</>;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="이미지 확대 보기"
      className={`cursor-zoom-in ${className}`.trim()}
      onClick={() => open(items, index)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(items, index);
        }
      }}
    >
      {children}
    </div>
  );
}
