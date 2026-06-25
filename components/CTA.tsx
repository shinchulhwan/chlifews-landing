import ContactForm from "@/components/ContactForm";

export default function CTA() {
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
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Aurora Residence에 관심이 있으시다면 아래 양식을 작성해 주세요.
            담당 컨설턴트가 빠르게 연락드립니다.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
