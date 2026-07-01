import { loadSiteSettings } from "@/lib/site-settings/load";

export default async function Footer({ siteName }: { siteName?: string }) {
  const settings = await loadSiteSettings(siteName);
  const phone = settings.contactPhone.replace(/[^0-9]/g, "");
  const phoneTel = phone ? `tel:${phone}` : undefined;

  return (
    <footer className="border-t border-white/10 bg-navy pb-24 pt-10 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center text-sm leading-relaxed text-white/60">
          <p className="text-white/80">
            <span className="font-medium">{settings.companyName}</span>
            {settings.contactPhone && (
              <>
                <span className="mx-2 text-white/30" aria-hidden="true">
                  |
                </span>
                <span>
                  대표번호:{" "}
                  {phoneTel ? (
                    <a
                      href={phoneTel}
                      className="font-medium text-gold transition-colors hover:text-gold/80"
                    >
                      {settings.contactPhone}
                    </a>
                  ) : (
                    settings.contactPhone
                  )}
                </span>
              </>
            )}
          </p>

          {settings.address && (
            <p className="text-xs text-white/50">{settings.address}</p>
          )}

          {settings.contactEmail && (
            <p className="text-xs text-white/50">{settings.contactEmail}</p>
          )}

          {settings.footerText && (
            <p className="mx-auto max-w-3xl text-xs leading-relaxed text-white/50 sm:text-sm">
              {settings.footerText}
            </p>
          )}

          <div className="space-y-1 pt-2 text-xs text-white/45">
            <p>개인정보관리책임자 : 신철환</p>
            <p>Copyright(C)2026 All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
