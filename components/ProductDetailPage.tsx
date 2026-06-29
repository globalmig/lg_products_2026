"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { adminStore, imageUrl, type CardDiscount } from "@/lib/adminStore";
import {
  LuChevronRight,
  LuWrench,
  LuRefreshCw,
  LuShieldCheck,
  LuTruck,
  LuMessageCircle,
  LuImage,
  LuChevronDown,
} from "react-icons/lu";


const CONTRACT_MONTHS = [72, 60, 48, 36];

export type DetailProduct = {
  id: string | number;
  category: string;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  price60?: number | null;
  price48?: number | null;
  price36?: number | null;
  image: string;
  detailImage?: string;
  detailImages?: string[];
  tags: { label: string; type: string }[];
  careService?: string;
  manageCycle?: string;
  color?: string;
  size?: string;
};

type Props = {
  product: DetailProduct;
  breadcrumb: { label: string; href: string }[];
  section?: string;
};

const benefits = [
  { Icon: LuWrench, title: "전문가 정기 점검", desc: "전문 매니저가 정기적으로 방문해 제품 상태를 점검·관리합니다." },
  { Icon: LuRefreshCw, title: "제품 업그레이드", desc: "약정 기간 후 최신 제품으로 업그레이드할 수 있습니다." },
  { Icon: LuShieldCheck, title: "완전 보장 서비스", desc: "사용 중 고장 시 무상 수리 또는 교체로 걱정 없이 사용하세요." },
  { Icon: LuTruck, title: "무료 배송·설치", desc: "전문 설치 기사가 무료로 배송 및 설치를 진행합니다." },
];

export default function ProductDetailPage({ product, breadcrumb, section }: Props) {
  const [imgError, setImgError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(72);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cards, setCards] = useState<CardDiscount[]>([]);

  useEffect(() => { adminStore.cardDiscounts.get().then(setCards); }, []);

  const selectedCard = selectedCardIdx !== null ? cards[selectedCardIdx] : null;

  const basePrice =
    selectedPeriod === 60 && product.price60 != null ? product.price60 :
    selectedPeriod === 48 && product.price48 != null ? product.price48 :
    selectedPeriod === 36 && product.price36 != null ? product.price36 :
    product.monthlyPrice;

  const cardPrice = selectedCard ? Math.max(0, basePrice - selectedCard.discount) : null;

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 브레드크럼 */}
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-3">
        <div className="mx-auto flex max-w-270 items-center gap-1 text-[12px] text-[#999]">
          <Link href="/" className="hover:text-[#c90f45]">홈</Link>
          {breadcrumb.map((b) => (
            <span key={b.href} className="flex items-center gap-1">
              <LuChevronRight size={12} />
              <Link href={b.href} className="hover:text-[#c90f45]">{b.label}</Link>
            </span>
          ))}
          <span className="flex items-center gap-1">
            <LuChevronRight size={12} />
            <span className="text-[#555]">{product.category}</span>
          </span>
        </div>
      </div>

      {/* 상품 메인 */}
      <section className="mx-auto max-w-270 px-5 py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* 좌측: 메인 이미지 */}
          <div className="lg:w-[45%] lg:max-w-120 lg:shrink-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
              {!imgError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 460px"
                  className="object-contain p-10"
                  onError={() => setImgError(true)}
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[#ccc]">
                  <LuImage size={40} />
                  <span className="text-[12px]">이미지 준비중</span>
                </div>
              )}
              <div
                className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full text-center text-[9px] sm:text-[10px] font-bold leading-[1.3] text-white"
                style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
              >
                LG전자<br />온라인<br />인증점
              </div>
            </div>
          </div>

          {/* 우측: 상품 정보 */}
          <div className="flex-1">
            <h1 className="mb-1 text-[20px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[24px]">
              {product.name}
            </h1>
            <p className="mb-6 text-[14px] text-[#aaa]">{product.model}</p>

            {/* 계약기간 */}
            <div className="mb-5">
              <p className="mb-2 text-[13px] font-semibold text-[#333]">계약기간</p>
              <div className="grid grid-cols-4 gap-2">
                {CONTRACT_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedPeriod(m)}
                    className={`rounded-lg border py-3 text-[14px] font-semibold transition-colors ${
                      selectedPeriod === m
                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                        : "border-[#e0e0e0] bg-white text-[#555] hover:border-[#999]"
                    }`}
                  >
                    {m}개월
                  </button>
                ))}
              </div>
            </div>

            {/* 옵션 행 */}
            {[
              { label: "케어서비스 주기", value: product.careService },
              { label: "관리주기", value: product.manageCycle },
              { label: "색상", value: product.color },
              { label: "크기", value: product.size },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} className="mb-3">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">{label}</p>
                <div className="flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] text-[#555]">
                  {value}
                </div>
              </div>
            ))}

            {/* 이용요금 / 제휴카드가 */}
            <div className="mb-4 mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-black text-[#1a1a1a]">이용요금</span>
                <span className="text-[14px] text-[#555]">
                  {selectedPeriod}개월 기준{" "}
                  <span className="text-[20px] font-black text-[#1a1a1a]">
                    월 {basePrice.toLocaleString()}
                  </span>
                  {" "}원
                </span>
              </div>
              {cardPrice !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-black text-[#1a1a1a]">제휴카드가</span>
                  <span className="text-[20px] font-black text-[#c90f45]">
                    월 {cardPrice.toLocaleString()} 원
                  </span>
                </div>
              )}
            </div>

            {/* 제휴카드 선택 박스 */}
            <div className="mb-6 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#555]">제휴카드 할인</span>
                <span className="text-[13px] text-[#888]">
                  월 최대 -{(cards[0]?.discount ?? 0).toLocaleString()}원
                </span>
              </div>

              {/* 드롭다운 트리거 */}
              <button
                type="button"
                onClick={() => setCardOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] text-[#333]"
              >
                <div className="flex items-center gap-2">
                  {selectedCard?.image_key && (
                    <div className="relative h-5 w-9 shrink-0">
                      <Image src={imageUrl(selectedCard.image_key)} alt="" fill className="object-contain" unoptimized />
                    </div>
                  )}
                  <span>{selectedCard ? selectedCard.name : "선택안함"}</span>
                </div>
                <LuChevronDown size={16} className={`text-[#999] transition-transform ${cardOpen ? "rotate-180" : ""}`} />
              </button>

              {/* 드롭다운 목록 */}
              {cardOpen && (
                <div className="mt-1 rounded-lg border border-[#e0e0e0] bg-white shadow-md">
                  <button
                    type="button"
                    onClick={() => { setSelectedCardIdx(null); setCardOpen(false); }}
                    className="block w-full px-4 py-3 text-left text-[14px] text-[#555] hover:bg-[#f5f5f5]"
                  >
                    선택안함
                  </button>
                  {cards.map((card, idx) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => { setSelectedCardIdx(idx); setCardOpen(false); }}
                      className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[14px] hover:bg-[#f5f5f5] ${
                        selectedCardIdx === idx ? "text-[#c90f45] font-semibold" : "text-[#333]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {card.image_key && (
                          <div className="relative h-5 w-9 shrink-0">
                            <Image src={imageUrl(card.image_key)} alt="" fill className="object-contain" unoptimized />
                          </div>
                        )}
                        <span>{card.name}</span>
                      </div>
                      <span className={`shrink-0 ${selectedCardIdx === idx ? "text-[#c90f45]" : "text-[#888]"}`}>
                        월 최대 -{card.discount.toLocaleString()}원
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 구독신청 버튼 */}
            <Link
              href={section ? `/consult?ids=${section}_${product.id}` : "/consult"}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#c90f45] text-[16px] font-black text-white transition-opacity hover:opacity-90"
            >
              <LuMessageCircle size={20} />
              구독 신청하기
            </Link>
            <p className="mt-3 text-center text-[12px] text-[#aaa]">구매 기능 없음 · 상담 후 진행됩니다</p>
          </div>
        </div>
      </section>

      {/* 상세 이미지 영역 */}
      <section className="border-t border-[#f1f1f1] px-5 py-12">
        <div className="mx-auto max-w-270">
          <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em]">상품 상세</h2>

          {(product.detailImage || (product.detailImages && product.detailImages.length > 0)) ? (
            <div className="flex flex-col gap-2">
              {product.detailImage && (
                product.detailImage.trimStart().startsWith("<") ? (
                  <div
                    className="w-full detail-html-content"
                    dangerouslySetInnerHTML={{ __html: product.detailImage }}
                  />
                ) : (
                  <div className="relative w-full overflow-hidden rounded-xl">
                    <Image src={product.detailImage} alt={`${product.name} 상세이미지`} width={1080} height={600} className="w-full object-cover" unoptimized />
                  </div>
                )
              )}
              {product.detailImages?.map((src, i) => (
                <div key={i} className="relative w-full overflow-hidden rounded-xl">
                  <Image src={src} alt={`${product.name} 상세이미지 ${i + 1}`} width={1080} height={600} className="w-full object-cover" unoptimized />
                </div>
              ))}
            </div>
          ) : (
            /* 상세 이미지 미등록 시 플레이스홀더 */
            <div className="flex flex-col gap-3">
              {[720, 540, 680].map((h, i) => (
                <div
                  key={i}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#f7f7f7] text-[#ccc]"
                  style={{ height: h > 600 ? 320 : h > 500 ? 240 : 280 }}
                >
                  <LuImage size={36} />
                  <span className="text-[13px]">상세 이미지 영역 {i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 가전구독 혜택 */}
      <section className="border-t border-[#f1f1f1] bg-[#fafafa] px-5 py-12">
        <div className="mx-auto max-w-270">
          <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em]">가전구독 혜택</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {benefits.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f3]">
                  <Icon size={20} className="text-[#c90f45]" />
                </div>
                <h3 className="mb-2 text-[15px] font-black">{title}</h3>
                <p className="text-[13px] leading-[1.7] text-[#666]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
