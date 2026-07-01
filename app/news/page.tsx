import {
  LuShoppingCart,
  LuStar,
  LuCamera,
  LuGift,
  LuCalendarDays,
  LuUsers,
  LuArrowRight,
} from "react-icons/lu";
import { FaStar } from "react-icons/fa";

export const metadata = {
  title: "리뷰 이벤트 | LG전자 BEST SHOP",
  description: "LG전자 베스트샵 용산점 구매 후기 이벤트 – 리뷰 작성하고 경품 받아가세요.",
};

const steps = [
  {
    step: "01",
    title: "구독 or 구매 상담",
    desc: "매장 방문 또는 온라인으로 상담 후 제품을 구독·구매하세요.",
    Icon: LuShoppingCart,
  },
  {
    step: "02",
    title: "네이버 지도 리뷰 작성",
    desc: "LG전자 베스트샵 용산점 네이버 지도 페이지에 별점 5점 + 50자 이상 후기를 남겨주세요.",
    Icon: LuStar,
  },
  {
    step: "03",
    title: "리뷰 캡처 제출",
    desc: "작성한 리뷰 화면을 캡처하여 카카오톡 채널 또는 상담 신청 폼으로 전송해주세요.",
    Icon: LuCamera,
  },
  {
    step: "04",
    title: "경품 수령",
    desc: "확인 후 영업일 3일 이내 문자로 경품 발송 안내드립니다.",
    Icon: LuGift,
  },
];

const prizes = [
  {
    rank: "1등",
    count: "매월 2명",
    name: "스타벅스 아메리카노\n10잔 쿠폰",
    value: "60,000원 상당",
    highlight: true,
  },
  {
    rank: "2등",
    count: "매월 5명",
    name: "편의점 상품권",
    value: "20,000원",
    highlight: false,
  },
  {
    rank: "참여 전원",
    count: "선착순 30명",
    name: "스타벅스 아메리카노\n1잔 쿠폰",
    value: "6,000원 상당",
    highlight: false,
  },
];

const reviews = [
  {
    name: "김*현",
    product: "LG 디오스 오브제컬렉션 냉장고",
    rating: 5,
    date: "2026.05.18",
    text: "상담부터 설치까지 꼼꼼하게 챙겨주셔서 정말 만족스러웠어요. 제품도 생각보다 훨씬 조용하고 공간 활용이 좋네요. 매니저님이 색상 조합까지 같이 고민해줘서 인테리어에도 딱 맞게 선택했습니다.",
  },
  {
    name: "박*은",
    product: "LG 워시타워 렌탈 가전 구독",
    rating: 5,
    date: "2026.05.12",
    text: "구독 서비스가 이렇게 편할 줄 몰랐어요. 설치도 빠르고 관리까지 해준다니 너무 좋아요. 용산점 매니저분이 실제 사용 팁도 알려주셔서 처음 사용하는 데 전혀 어렵지 않았습니다.",
  },
  {
    name: "이*준",
    product: "LG 스탠바이미 2 렌탈 가전 구독",
    rating: 5,
    date: "2026.04.29",
    text: "혼자 사는데 거실에 두기 딱 좋은 사이즈예요. 가격 대비 화질이 정말 좋고, 배터리로 어디서나 볼 수 있어서 활용도가 높아요. 매장에서 직접 비교하고 구매할 수 있어서 좋았습니다.",
  },
];

export default function ReviewEventPage() {
  return (
    <main className="bg-white text-[#1a1a1a]">

      {/* 히어로 */}
      <section className="relative overflow-hidden bg-[#0d0d0d] px-5 py-14 sm:py-20 lg:py-28">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #c90f45 0%, transparent 60%), radial-gradient(circle at 20% 80%, #ff6b35 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px]">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c90f45]/50 bg-[#c90f45]/10 px-4 py-1.5 text-[13px] font-bold text-[#ff6b8a]">
            <LuGift size={14} />
            2026년 6월 리뷰 이벤트
          </span>
          <h1 className="mt-4 text-[28px] font-black leading-[1.18] tracking-[-0.04em] text-white sm:text-[42px] lg:text-[56px]">
            후기 남기고<br />
            <span className="text-[#ff6b8a]">경품 받아가세요</span>
          </h1>
          <p className="mt-5 max-w-[560px] break-keep text-[15px] leading-[1.8] text-white/70 sm:text-[16px]">
            LG전자 베스트샵 용산점에서 구독·구매 후 네이버 지도 리뷰를 작성하시면 추첨을 통해 경품을 드립니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-[13px] font-semibold text-white/50">
            <span className="flex items-center gap-1.5">
              <LuCalendarDays size={14} />
              이벤트 기간 : 2026.06.01 – 06.30
            </span>
            <span className="flex items-center gap-1.5">
              <LuUsers size={14} />
              대상 : 구독·구매 완료 고객
            </span>
          </div>
        </div>
      </section>

      {/* 참여 방법 */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">HOW TO</p>
          <h2 className="mb-12 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">이렇게 참여하세요</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f3]">
                  <s.Icon size={22} className="text-[#c90f45]" />
                </div>
                <span className="mb-2 block text-[12px] font-black tracking-[0.1em] text-[#c90f45]">STEP {s.step}</span>
                <h3 className="mb-2 text-[16px] font-black tracking-[-0.03em]">{s.title}</h3>
                <p className="text-[13px] leading-[1.7] text-[#666]">{s.desc}</p>
                {s.step !== "04" && (
                  <LuArrowRight
                    size={20}
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[#ddd] lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 경품 안내 */}
      <section className="bg-[#fafafa] px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">PRIZE</p>
          <h2 className="mb-10 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">경품 안내</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {prizes.map((prize) => (
              <div
                key={prize.rank}
                className={`rounded-2xl p-7 ${
                  prize.highlight
                    ? "bg-gradient-to-br from-[#c90f45] to-[#8b0030] text-white shadow-lg"
                    : "border border-[#ebebeb] bg-white"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-black ${
                      prize.highlight ? "bg-white/20 text-white" : "bg-[#fff0f3] text-[#c90f45]"
                    }`}
                  >
                    {prize.rank}
                  </span>
                  <span className={`text-[12px] font-semibold ${prize.highlight ? "text-white/70" : "text-[#999]"}`}>
                    {prize.count}
                  </span>
                </div>
                <p
                  className={`whitespace-pre-line text-[20px] font-black leading-[1.4] tracking-[-0.03em] ${
                    prize.highlight ? "text-white" : "text-[#1a1a1a]"
                  }`}
                >
                  {prize.name}
                </p>
                <p className={`mt-2 text-[13px] font-semibold ${prize.highlight ? "text-white/80" : "text-[#888]"}`}>
                  {prize.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[12px] text-[#aaa]">
            ※ 당첨자 발표는 매월 초 개별 문자 발송 / 경품은 변경될 수 있습니다.
          </p>
        </div>
      </section>

      {/* 생생 후기 */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">REVIEW</p>
          <h2 className="mb-10 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">고객 생생 후기</h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl border border-[#f0f0f0] bg-white p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <FaStar key={i} size={14} className="text-[#f5a623]" />
                  ))}
                </div>
                <p className="mb-4 break-keep text-[14px] leading-[1.75] text-[#444]">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="border-t border-[#f5f5f5] pt-4">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">{r.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#999]">{r.product}</p>
                  <p className="mt-0.5 text-[11px] text-[#bbb]">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
