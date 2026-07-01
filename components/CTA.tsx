import ContactForm from "@/components/ContactForm";

export default function CTA({ siteName }: { siteName?: string }) {
  return (
    <section id="contact" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Contact
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            관심고객 등록
          </h2>
          <p className="mx-auto max-w-lg whitespace-pre-line text-sm leading-relaxed text-white/70 sm:text-base">
            {`동암역 더트루엘 관심고객등록 이벤트
관심고객등록 후 계약시 100만원 계약축하금 지원
선착순 30고객! 지금 바로 등록 후 상담 받으세요`}
          </p>
        </div>

        <ContactForm siteName={siteName} />
      </div>
    </section>
  );
}
