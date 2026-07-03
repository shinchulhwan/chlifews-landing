import ContactForm from "@/components/ContactForm";
import MobileContactActions from "@/components/mobile/MobileContactActions";
import MobileFadeSection from "@/components/mobile/MobileFadeSection";
import { loadSiteSettings } from "@/lib/site-settings/load";

export default async function CTA({ siteName }: { siteName?: string }) {
  const settings = await loadSiteSettings(siteName);

  return (
    <section id="contact" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile — 큰 액션 버튼 */}
        <div className="md:hidden">
          <MobileFadeSection>
            <div className="mb-8 text-center">
              <p className="mb-3 text-[15px] font-medium tracking-[0.2em] text-gold uppercase">
                Contact
              </p>
              <h2 className="text-[32px] font-bold leading-[1.3] text-white">관심고객 등록</h2>
              <p className="mx-auto mt-4 max-w-sm whitespace-pre-line text-base leading-[1.7] text-white/70">
                {`동암역 더트루엘 관심고객등록 이벤트
선착순 30고객! 지금 바로 상담 받으세요`}
              </p>
            </div>
            <MobileContactActions phone={settings.contactPhone} />
          </MobileFadeSection>
        </div>

        {/* Desktop — 기존 헤더 유지 */}
        <div className="mb-12 hidden text-center md:block">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Contact
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            관심고객 등록
          </h2>
          <p className="mx-auto max-w-lg whitespace-pre-line text-sm leading-relaxed text-white/70 sm:text-base">
            {`동암역 더트루엘 관심고객등록 이벤트
선착순 30고객! 지금 바로 등록 후 상담 받으세요`}
          </p>
        </div>

        <div id="contact-form">
          <ContactForm siteName={siteName} />
        </div>
      </div>
    </section>
  );
}
