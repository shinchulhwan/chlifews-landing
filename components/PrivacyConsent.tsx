"use client";

import { useId, useState } from "react";
import {
  PRIVACY_CONSENT_ITEMS,
  PRIVACY_CONSENT_LABEL,
  PRIVACY_CONSENT_TITLE,
} from "@/lib/constants/privacy-consent";

type PrivacyConsentProps = {
  error?: string;
  onChange?: () => void;
};

export default function PrivacyConsent({ error, onChange }: PrivacyConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const detailsId = useId();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="privacy_consent"
            value="yes"
            className="mt-0.5 size-4 shrink-0 rounded border-white/30 bg-white/10 accent-gold"
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${detailsId}-error` : undefined}
          />
          <span className="text-sm leading-relaxed text-white/80">
            {PRIVACY_CONSENT_LABEL}{" "}
            <span className="text-gold">(필수)</span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="shrink-0 text-sm font-medium text-gold underline-offset-2 transition-colors hover:text-gold/80 hover:underline"
          aria-expanded={isOpen}
          aria-controls={detailsId}
        >
          자세히보기
        </button>
      </div>

      {isOpen && (
        <div
          id={detailsId}
          className="mt-4 rounded-xl border border-white/10 bg-navy/40 px-4 py-4 text-sm leading-relaxed text-white/75"
        >
          <p className="mb-3 font-semibold text-white/90">
            &lt; {PRIVACY_CONSENT_TITLE} &gt;
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {PRIVACY_CONSENT_ITEMS.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      )}

      {error && (
        <p id={`${detailsId}-error`} className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
