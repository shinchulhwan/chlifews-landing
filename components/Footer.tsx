const FOOTER_PHONE = "1844-0148";
const FOOTER_PHONE_TEL = "tel:18440148";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy pb-24 pt-10 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center text-sm leading-relaxed text-white/60">
          <p className="text-white/80">
            <span className="font-medium">씨에이치랩스</span>
            <span className="mx-2 text-white/30" aria-hidden="true">
              |
            </span>
            <span>
              대표번호:{" "}
              <a
                href={FOOTER_PHONE_TEL}
                className="font-medium text-gold transition-colors hover:text-gold/80"
              >
                {FOOTER_PHONE}
              </a>
            </span>
          </p>

          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-white/50 sm:text-sm">
            *본 홈페이지에 사용된 이미지 및 내용은 소비자의 이해를 돕기 위한 것으로
            실제와 다르거나 인허가 과정에 따라 변경될 수 있습니다.
          </p>

          <div className="space-y-1 pt-2 text-xs text-white/45">
            <p>개인정보관리책임자 : 신철환</p>
            <p>Copyright(C)2026 All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
