"use client";

import Image from "next/image";
import { useState } from "react";

type BenefitItem = {
  id: number;
  badge: string;
  title: string;
  icon: string;
  hasPlus?: boolean;
  condition: string;
  benefit: string;
  link?: string;
  // 더보기 시 표시할 상세 내용 (카드별로 자유롭게 설정)
  extra?: string[];
};

const items: BenefitItem[] = [
  {
    id: 1,
    badge: "월 구독료 최대 5%",
    title: "재구독 할인",
    icon: "/images/icon/3D/return.png",
    condition: "구독 기간이 만기한 고객이 동일 카테고리의 새 제품을 연달아 구독하거나 교차 카테고리로 구독",
    benefit: "월 요금 5% 할인",
    extra: [
      "· 구독 기간 만기 기준: 계약 만기 124일 전부터 만기 후 1년까지 재구독 할인 대상",
      "· 6년 계약에 한해 최대 할인율이 적용되며, 계약 기간에 따라 할인율은 차등 적용되거나 미적용 될 수 있습니다.",
      "· 단, 기존 정수기 이용 고객은 정수기 외 제품으로 교차 재구독이 불가하며, 정수기 동일 제품군만 재구독 가능합니다.",
    ],
  },
  {
    id: 2,
    badge: "월 구독료 최대 3%",
    title: "기존 결합 할인",
    icon: "/images/icon/3D/clip.png",
    hasPlus: true,
    condition: "가전 구독을 하고 있는 고객이 추가로 다른 제품군의 가전 구독",
    benefit: "월 요금 3% 할인",
    extra: [
      "· 가전 구독 6년 차부터 결합 할인 혜택 적용",
      "· 결합 혜택은 최대 3%로 제품군, 계약 기간에 따라 혜택은 상이",
      "· 위 혜택은 2024년 7월부터 운영하며 당사 사정으로 내용이 변경될 수 있음",
      "· 동일한 제품군을 구독하는 경우 혜택이 적용되지 않습니다. 예) 제습기 + 제습기 단, 정수기 구독을 하고 있는 고객이 추가로 정수기를 구독하는 경우에는 결합 혜택이 적용됩니다.",
      "· 6년 계약에 한해 최대 할인율이 적용되며, 계약 기간에 따라 할인율은 차등 적용되거나 미적용 될 수 있습니다.",
    ],
  },
  {
    id: 3,
    badge: "월 구독료 최대 5%",
    title: "신규 결합 할인",
    icon: "/images/icon/3D/new.png",
    hasPlus: true,
    condition: "가전 구독을 처음 하는 고객이 동시에 두개 이상의 제품군을 구독하는 경우",
    benefit: "6년 구독 시, 월 요금 5% 할인 / 4년·5년 구독 시, 월 요금 3% 할인",
    extra: [
      "· 가전 구독 4년 이상 계약부터 결합할인 혜택 적용",
      "· 결합 혜택은 최대 5%로 제품군, 계약 기간에 따라 혜택은 상이",
      "· 위 혜택은 2024년 7월부터 운영하며 당사 사정으로 내용이 변경될 수 있음",
      "· 동일한 제품군을 구독하는 경우 혜택이 적용되지 않습니다. 예) 제습기 + 제습기 단, 정수기 구독을 하고 있는 고객이 추가로 정수기를 구독하는 경우에는 결합 혜택이 적용됩니다.",
      "· 6년 계약에 한해 최대 할인율이 적용되며, 계약 기간에 따라 할인율은 차등 적용되거나 미적용 될 수 있습니다.",
    ],
  },
  {
    id: 4,
    badge: "월 구독료 최대 3%",
    title: "가전 연계 할인",
    icon: "/images/icon/3D/saleTag.png",
    hasPlus: true,
    condition: "최근 1년 이내 LGE.COM에서 100만원 이상 단일 일시불 주문 후 배송완료",
    benefit: "월 요금 최대 3% 할인",
    extra: [
      "· 멤버십 포인트를 제외한 실 결제금액이 100만원 이상인 주문을 보유한 경우 대상이 됩니다. (기간 합산이 아닌 단일 주문 내 실 결제금액 기준이며, 소모품은 제외됩니다.)",
      "· 정수기 청약 시 최근 1년 이내, 그 외 제품 청약 시 전월 1일부터 현재까지 배송 완료된 주문만 대상에 포함됩니다.",
      "· 취소 또는 반품으로 인해 실 결제금액이 100만원 미만이 될 경우 대상에서 제외됩니다.",
      "· 신규결합, 기존결합 할인, 재구독 할인 등 다른 할인 혜택과 중복 적용이 불가하며, 2개 이상 제품 동시 청약 시에도 가전연계 할인이 적용되지 않습니다.",
      "· 6년 계약에 한해 최대 할인율이 적용되며, 계약 기간에 따라 할인율이 차등 적용되거나 미적용될 수 있습니다.",
    ],
  },
  {
    id: 5,
    badge: "월 구독료 할인",
    title: "선납 할인",
    icon: "/images/icon/3D/timeCoin.png",
    condition: "가전구독 시, 총 구독 요금의 일부를 미리 납부하는 경우",
    benefit: "선납금액에 따라 월 요금 할인",
    extra: [
      "· 2대 이상의 가전 제품을 구매하실 경우 다품목 멤버십 포인트 혜택이 적용됩니다.",
      "· 개인 고객 제품별 최대 주문 가능 수량은 정수기 1대, 에어케어 1대, 에어컨 1대, 냉장고 3대, 노트북 1대, 기타 1대입니다.",
      "· 냉장고 품목에는 얼음정수기냉장고, DIOS냉장고, 김치냉장고, 일반냉장고, 냉동고가 포함됩니다.",
      "· 에어케어 품목에는 공기청정기, 에어로타워, 에어로퍼니처, 하이드로타워, 제습기가 포함됩니다.",
      "· 에어컨 품목에는 스탠드에어컨, 벽걸이에어컨, 주거용 환기가 포함됩니다.",
      "· 해당 월 내 구독한 상품을 합산하여 혜택을 받을 수 있습니다.",
      "· LGE.COM에서 동일 월 최초 구독 시 WELCOME 혜택 조건 충족 시 추가 포인트가 지급됩니다.",
      "· 3품목 이상 구독 시 추가 다품목 혜택이 함께 적용됩니다.",
      "· LGE.COM 구독 건에 한하여 혜택이 제공됩니다.",
      "· 행사 채널은 LGE.COM 가전 구독 계약 ONLY 적용됩니다.",
      "· 행사 모델은 LGE.COM에서 구독 가능한 전 모델 대상입니다.",
      "· 혜택 지급은 배송 완료 후 익월 말 지급됩니다.",
    ],
  },
  {
    id: 6,
    badge: "월 구독료 최대 3%",
    title: "다품목 캐시백",
    icon: "/images/icon/3D/plus.png",
    condition: "두개 이상의 제품군을 동시에 LGE.COM에서 구매와 구독할 경우, 제품 품목수에 따라 캐시백 지급",
    benefit: "구매와 구독하는 가전 수에 따라 되돌려 받는 금액이 올라가요.",
    link: "보러가기 >",
    extra: ["· 한 개 이상의 가전 제품을 구매하실 경우에만 다품목 캐시백 혜택이 적용됩니다."],
  },
];

function BenefitCard({ item }: { item: BenefitItem }) {
  const [open, setOpen] = useState(false);
  const hasExtra = (item.extra?.length ?? 0) > 0;

  return (
    <div
      className="relative rounded-2xl p-6 pt-4"
      style={{
        background: "linear-gradient(135deg, #ffffff 40%, #FFF0F3 100%)",
        boxShadow: "2px 3px 12px #FFCED8",
      }}
    >
      <div className="animate-float absolute -right-3 -top-14 sm:-top-16 lg:-top-20" style={{ animationDelay: `${(item.id - 1) * 0.4}s` }}>
        <div className="relative w-25 h-25 sm:w-32.5 sm:h-32.5 lg:w-42.5 lg:h-42.5">
          <Image src={item.icon} alt="" fill className="object-contain" />
        </div>
      </div>

      <span className="inline-flex w-fit rounded-full bg-[#c90f45] px-3 py-1 text-[11px] font-bold text-white">{item.badge}</span>

      <h3 className="mb-4 mt-3 text-[22px] font-black leading-[1.3] tracking-[-0.04em] text-[#1a1a1a]">{item.title}</h3>

      <div className="border-t border-[#f0c0cc] pt-4">
        <p className="mb-1 text-[12px] font-bold text-[#c90f45]">할인조건</p>
        <p className="text-[13px] leading-[1.6] text-[#555]">{item.condition}</p>
      </div>

      <div className="my-3 border-t border-[#f0c0cc]" />

      <div>
        <p className="mb-1 text-[12px] font-bold text-[#c90f45]">혜택 내역</p>
        <p className="text-[13px] leading-[1.6] text-[#555]">{item.benefit}</p>
        {item.link && (
          <a href="#" className="mt-1 block text-[13px] font-medium text-[#c90f45]">
            {item.link}
          </a>
        )}
      </div>

      {/* 더보기 시 표시되는 상세 내용 */}
      {hasExtra && open && (
        <div className="mt-3 space-y-1 rounded-xl bg-[#fff5f7] p-4 break-keep">
          {item.extra!.map((line, i) => (
            <p key={i} className="text-[12px] leading-[1.9] mb-3 text-[#888]">
              {line}
            </p>
          ))}
        </div>
      )}

      {hasExtra && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-4 w-full border-t border-[#f0c0cc] pt-3 text-center text-[12px] text-[#888] hover:text-[#555]">
          {open ? "접기 ∧" : "더보기 ∨"}
        </button>
      )}
    </div>
  );
}

function MembershipCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative rounded-2xl p-6 pt-4"
      style={{
        background: "linear-gradient(135deg, #ffffff 40%, #fde4ec 100%)",
        boxShadow: "2px 3px 12px #FFCED8",
      }}
    >
      <div className="animate-float absolute -right-3 -top-14 sm:-top-16 lg:-top-20" style={{ animationDelay: "0.2s" }}>
        <div className="relative w-25 h-25 sm:w-32.5 sm:h-32.5 lg:w-42.5 lg:h-42.5">
          <Image src="/images/icon/3D/coin.png" alt="" fill className="object-contain" />
        </div>
      </div>

      <span className="inline-flex w-fit rounded-full bg-[#ff6b00] px-3 py-1 text-[11px] font-bold text-white">최대 30만 포인트</span>

      <h3 className="mb-4 mt-3 text-[22px] font-black leading-[1.3] tracking-[-0.04em] text-[#1a1a1a]">
        LG전자 멤버십
        <br />
        포인트
      </h3>

      <div className="border-t border-[#f0c0cc] pt-4">
        <p className="mb-1 text-[12px] font-bold text-[#c90f45]">구독이 처음이신 분</p>
        <p className="text-[13px] leading-[1.6] text-[#555]">이미 구독을 하고 있다라도 LGE.COM 첫구독 고객이라면 멤버십 포인트가 지급됩니다.</p>
      </div>

      <div className="my-3 border-t border-[#f0c0cc]" />

      <div>
        <p className="mb-1 text-[12px] font-bold text-[#c90f45]">LGE.COM에 이미 구독을 하고 계신 분</p>
        <p className="text-[13px] leading-[1.6] text-[#555]">추가 품목 구독 시 다품목 멤버십 포인트 혜택이 적용됩니다.</p>
      </div>

      {open && (
        <div className="mt-3 space-y-1 rounded-xl bg-[#fff5f7] p-4 break-keep">
          {[
            "· 신규결합, 기존결합, 재구독 할인, 가전연계 할인 혜택과 중복 적용이 가능합니다.",
            "· 선납금은 합산 결제가 가능합니다.",
            "· 선납금 분할 결제는 불가합니다. (예: 선납금 카드 2개 분할 결제 불가)",
            "· 선납금 매세스 포인트 결제는 불가합니다.",
            "· 선납 할인은 일부 가능 모델에 한하여 총 구독료의 30%까지 선납 가능합니다.",
          ].map((line, i) => (
            <p key={i} className="text-[12px] leading-[1.9] mb-3 text-[#888]">
              {line}
            </p>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} className="mt-4 w-full border-t border-[#f0c0cc] pt-3 text-center text-[12px] text-[#888] hover:text-[#555]">
        {open ? "접기 ∧" : "더보기 ∨"}
      </button>
    </div>
  );
}

export default function BenefitTab() {
  return (
    <section className="relative overflow-hidden py-16">
      <Image src="/images/bg_white_benefit.png" alt="" fill sizes="100vw" className="object-cover object-center" />
      <div className="relative z-10 mx-auto max-w-[1080px] px-5">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[13px] font-medium text-[#c90f45]">더 많은 구독료 혜택을 받을 수 있나요?</p>
          <h2 className="text-[24px] sm:text-[32px] font-black leading-[1.35] tracking-[-0.05em] text-[#1a1a1a]">
            고객님의 조건에 적합한
            <br />
            다양한 혜택을 안내드립니다
          </h2>
        </div>

        {/* 카드 그리드 — 아이콘 overflow 공간 확보 위해 pt-12 */}
        <div className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-16 pt-12">
          {items.map((item) => (
            <BenefitCard key={item.id} item={item} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-12">
          <MembershipCard />
          <a
            href="https://docs.google.com/forms/d/1eE__jHrr2ywkEuFu0G18wEFIdKqUt9AUdbsGv6k94sY/edit"
            className="flex items-center justify-center rounded-2xl bg-[#c90f45] p-6 text-center"
            style={{ boxShadow: "0 8px 28px rgba(255, 204, 218, 0.89)" }}
          >
            <span className="text-[28px] font-black leading-[1.4] text-white">상담 신청!</span>
          </a>
        </div>
      </div>
    </section>
  );
}
