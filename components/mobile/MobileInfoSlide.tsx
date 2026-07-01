import type { ReactNode } from "react";

type MobileInfoSlideProps = {
  label: string;
  value: ReactNode;
  accent?: boolean;
};

export function MobileInfoSlide({ label, value, accent }: MobileInfoSlideProps) {
  return (
    <div className="flex min-h-[min(70vh,520px)] flex-col items-center justify-center rounded-[20px] border border-navy/10 bg-white px-6 py-10 text-center shadow-sm">
      <p className="text-[15px] font-semibold tracking-wide text-gold uppercase">
        {label}
      </p>
      <p
        dir="ltr"
        className={`mt-6 max-w-xs text-[32px] font-bold leading-[1.3] text-navy [unicode-bidi:plaintext] ${
          accent ? "text-gold" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function MobileImageSlide({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-[min(70vh,520px)] overflow-hidden rounded-[20px] bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
