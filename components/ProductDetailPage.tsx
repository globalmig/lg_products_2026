"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { adminStore, imageUrl, type CardDiscount } from "@/lib/adminStore";
import { dedupeMapNames, withLazyImages, extractBodyContent } from "@/lib/detailHtml";
import SubscriptionBenefits from "@/components/SubscriptionBenefits";
import {
  LuChevronRight,
  LuMessageCircle,
  LuImage,
  LuChevronDown,
} from "react-icons/lu";


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
  periodPrices?: { label: string; price: number }[];
  careServiceItems?: { label: string; cycle: string; prices?: { period: string; price: number }[] }[];
  colorItems?: { name: string; image: string }[];
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

const CARE_GROUP_PERIODS = ["72개월", "60개월", "48개월"];

export default function ProductDetailPage({ product, breadcrumb, section }: Props) {
  const [imgError, setImgError] = useState(false);
  const hasPeriodPrices = (product.periodPrices?.length ?? 0) > 0;
  // 케어서비스 주기가 입력되지 않은 항목(라벨/가격만 있고 주기 텍스트가 비어있는 경우)은
  // 화면에 빈 버튼으로 노출되는 문제가 있어 아예 목록에서 제외한다.
  const visibleCareServiceItems = (product.careServiceItems ?? []).filter(
    (cs) => (cs.cycle ?? "").trim() !== ""
  );
  // 기본 계약기간은 "1번째 등록된 케어서비스 항목"이 실제로 값을 가진 개월수(72→60→48 순)로 맞춘다.
  // periodPrices는 전체 케어서비스 항목을 통틀어 값이 있는 기간 목록이라, 1번째 항목엔 없는
  // 기간이 기본 선택되면 basePrice가 null이 되어 있는데도 "상담 문의 시 안내"로 보이는 문제가 있었다.
  const firstCarePrices = visibleCareServiceItems[0]?.prices ?? [];
  const defaultPeriod = firstCarePrices.length > 0
    ? (CARE_GROUP_PERIODS.find((period) => firstCarePrices.some((p) => p.period === period)) ?? firstCarePrices[0].period)
    : hasPeriodPrices ? product.periodPrices![0].label : "72개월";
  // 리스트에 노출되는 가격은 모든 케어서비스 항목×기간 중 최솟값이므로, 상세페이지도 진입 시
  // 그 최저가 조합(항목+기간)을 기본 선택해야 리스트가와 상세 첫 화면 가격이 일치한다.
  const careCombos = visibleCareServiceItems.flatMap((item, idx) =>
    (item.prices ?? [])
      .filter((p) => Number.isFinite(p.price))
      .map((p) => ({ idx, period: p.period, price: p.price }))
  );
  const cheapestCombo = careCombos.length > 0
    ? careCombos.reduce((min, c) => (c.price < min.price ? c : min))
    : null;
  const [selectedPeriod, setSelectedPeriod] = useState(cheapestCombo?.period ?? defaultPeriod);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedCareIdx, setSelectedCareIdx] = useState(cheapestCombo?.idx ?? 0);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cards, setCards] = useState<CardDiscount[]>([]);

  useEffect(() => { adminStore.cardDiscounts.get().then(setCards); }, []);
  useEffect(() => { setImgError(false); }, [selectedColorIdx]);

  const selectedCard = selectedCardIdx !== null ? cards[selectedCardIdx] : null;

  const hasCareItems = visibleCareServiceItems.length > 0;
  const hasCareMatrix = hasCareItems && visibleCareServiceItems.some((cs) => (cs.prices?.length ?? 0) > 0);
  const selectedCareItem = hasCareItems ? visibleCareServiceItems[selectedCareIdx] : undefined;

  const legacyBasePrice = (() => {
    if (hasPeriodPrices) {
      // 가격이 0으로 비어있는 레거시 periodPrices 항목(미입력 스텁)은 무시하고 monthlyPrice로 대체한다.
      const found = product.periodPrices!.find((p) => p.label === selectedPeriod)?.price;
      return found ? found : product.monthlyPrice;
    }
    const m = parseInt(selectedPeriod);
    if (m === 60 && product.price60 != null) return product.price60;
    if (m === 48 && product.price48 != null) return product.price48;
    if (m === 36 && product.price36 != null) return product.price36;
    return product.monthlyPrice;
  })();

  // 케어서비스별 계약기간 매트릭스가 있으면 해당 조합의 가격을, 없으면 기존 계약기간 기준 가격을 사용한다.
  // 매트릭스는 있는데 선택한 조합의 값이 비어있으면 null을 반환해 "상담 문의 시 안내"로 표시한다.
  const basePrice = hasCareMatrix
    ? selectedCareItem?.prices?.find((p) => p.period === selectedPeriod)?.price ?? null
    : legacyBasePrice;

  const hasColorItems = (product.colorItems?.length ?? 0) > 0;
  const displayImage = (hasColorItems && product.colorItems![selectedColorIdx]?.image)
    ? product.colorItems![selectedColorIdx].image
    : product.image;

  const cardPrice = selectedCard && basePrice !== null ? Math.max(0, basePrice - selectedCard.discount) : null;

  // 원본 상세 HTML은 크기가 매우 클 수 있어, 계약기간/케어서비스/카드 선택 등
  // 다른 상태가 바뀔 때마다 재렌더링되며 정규식 변환이 다시 도는 것을 막기 위해 메모이즈한다.
  // 전체 문서/프래그먼트 구분 없이 body 내용만 페이지 DOM에 직접 삽입하고, 네이티브
  // loading="lazy"로 지연 로드한다(실제 페이지 스크롤 안이라 정상 동작한다).
  const processedDetailHtml = useMemo(() => {
    if (!product.detailImage) return "";
    return withLazyImages(dedupeMapNames(extractBodyContent(product.detailImage)));
  }, [product.detailImage]);

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
        <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-16">

          {/* 좌측: 메인 이미지 */}
          <div className="mx-auto w-full max-w-90 sm:max-w-105 md:w-[42%] md:max-w-100 md:shrink-0 lg:w-[45%] lg:max-w-120">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
              {displayImage && !imgError ? (
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 460px, (min-width: 768px) 42vw, (min-width: 640px) 420px, 360px"
                  className="object-contain"
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
            </div>
          </div>

          {/* 우측: 상품 정보 */}
          <div className="flex-1">
            {product.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      tag.type === "hot" || tag.type === "md"
                        ? "bg-[#fff0f3] text-[#c90f45]"
                        : tag.type === "naver"
                        ? "bg-[#03c75a] text-white"
                        : "bg-[#f5f5f5] text-[#666]"
                    }`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mb-1 text-[20px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[24px]">
              {product.name}
            </h1>
            <p className="mb-6 text-[14px] text-[#aaa]">{product.model}</p>

            {/* 계약기간 / 케어서비스 주기 */}
            <div className="mb-5 divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
              {/* 계약기간 */}
              <div className="flex items-stretch gap-2 py-2.5 sm:py-3">
                <div className="flex w-[64px] shrink-0 items-center text-[12px] font-semibold leading-tight text-[#333] sm:w-[104px] sm:text-[14px]">
                  계약기간
                </div>
                <div className="flex flex-1 gap-2">
                  {(hasPeriodPrices
                    ? product.periodPrices!
                    : [72, 60, 48, 36].map((m) => ({ label: `${m}개월`, price: m === 72 ? product.monthlyPrice : m === 60 ? (product.price60 ?? product.monthlyPrice) : m === 48 ? (product.price48 ?? product.monthlyPrice) : (product.price36 ?? product.monthlyPrice) }))
                  ).map((period) => (
                    <button
                      key={period.label}
                      type="button"
                      onClick={() => setSelectedPeriod(period.label)}
                      className="flex flex-1 items-center justify-center py-1"
                    >
                      <span
                        className={`flex w-full items-center justify-center rounded-md border py-1.5 text-[12px] font-semibold transition-colors sm:text-[14px] ${
                          selectedPeriod === period.label
                            ? "border-[#1a1a1a] text-[#1a1a1a]"
                            : "border-[#e0e0e0] text-[#888] hover:border-[#999] hover:text-[#333]"
                        }`}
                      >
                        {period.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 케어서비스 주기 */}
              {hasCareItems ? (
                <div className="flex items-stretch gap-2 py-2.5 sm:py-3">
                  <div className="flex w-[64px] shrink-0 items-center text-[12px] font-semibold leading-tight text-[#333] sm:w-[104px] sm:text-[14px]">
                    케어서비스 주기
                  </div>
                  <div className="flex flex-1 gap-2">
                    {visibleCareServiceItems.map((cs, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCareIdx(i)}
                        className="flex flex-1 items-center justify-center py-1"
                      >
                        <span
                          className={`flex w-full flex-col items-center justify-center rounded-md border px-1 py-1.5 transition-colors ${
                            selectedCareIdx === i ? "border-[#1a1a1a]" : "border-[#e0e0e0] hover:border-[#999]"
                          }`}
                        >
                          <span className={`text-[12px] font-semibold sm:text-[14px] ${selectedCareIdx === i ? "text-[#1a1a1a]" : "text-[#888]"}`}>
                            {cs.label}
                          </span>
                          {cs.cycle && (
                            <span className={`text-[11px] ${selectedCareIdx === i ? "text-[#666]" : "text-[#aaa]"}`}>
                              {cs.cycle}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (product.careService || product.manageCycle) ? (
                <div className="flex items-stretch gap-2 py-2.5 sm:py-3">
                  <div className="flex w-[64px] shrink-0 items-center text-[12px] font-semibold leading-tight text-[#333] sm:w-[104px] sm:text-[14px]">
                    케어서비스 주기
                  </div>
                  <div className="flex flex-1 items-center px-1 text-[13px] text-[#555] sm:text-[14px]">
                    {product.careService}{product.manageCycle ? ` / ${product.manageCycle}` : ""}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 색상 */}
            {hasColorItems ? (
              <div className="mb-3">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">색상</p>
                <div className="flex flex-wrap gap-2">
                  {product.colorItems!.map((ci, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColorIdx(i)}
                      className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-[14px] ${
                        selectedColorIdx === i
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                          : "border-[#e0e0e0] bg-white text-[#555] hover:border-[#999]"
                      }`}
                    >
                      {ci.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : product.color ? (
              <div className="mb-3">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">색상</p>
                <div className="flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] text-[#555]">
                  {product.color}
                </div>
              </div>
            ) : null}

            {/* 이용요금 (제휴카드 적용가 병기) */}
            <div className="mb-4 mt-6">
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-black text-[#1a1a1a]">이용요금</span>
                {basePrice !== null ? (
                  <div className="flex flex-col gap-y-1">
                    {cardPrice !== null && (
                      cardPrice > 0 ? (
                        <span className="text-[13px] font-semibold text-[#c90f45]">
                          (제휴카드 이용시 월 {cardPrice.toLocaleString()}원)
                        </span>
                      ) : (
                        <span className="text-[13px] font-semibold text-[#c90f45]">
                          (제휴카드 할인 적용가는 상담 문의 시 안내드립니다)
                        </span>
                      )
                    )}
                    <span className="text-[14px] text-[#555] wrap-break-word">
                      <span className="text-[20px] font-black text-[#1a1a1a]">
                        월 {basePrice.toLocaleString()}
                      </span>
                      원
                    </span>
                  </div>
                ) : (
                  <span className="text-[14px] font-semibold text-[#c90f45]">상담 문의 시 안내드립니다</span>
                )}
              </div>
            </div>

            {/* 제휴카드 선택 박스 */}
            <div className="mb-6 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3.5 sm:px-4 sm:py-4">
              <div className="mb-3 flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#555]">제휴카드 할인</span>
              </div>

              {/* 드롭다운 트리거 */}
              <button
                type="button"
                onClick={() => setCardOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-[13px] text-[#333] sm:px-4 sm:py-3 sm:text-[14px]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {selectedCard?.image_key && (
                    <div className="relative h-5 w-9 shrink-0">
                      <Image src={imageUrl(selectedCard.image_key)} alt="" fill className="object-contain" unoptimized />
                    </div>
                  )}
                  <span className="truncate">{selectedCard ? selectedCard.name : "선택안함"}</span>
                </div>
                <LuChevronDown size={16} className={`shrink-0 text-[#999] transition-transform ${cardOpen ? "rotate-180" : ""}`} />
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
                      className={`relative flex w-full flex-col gap-1 py-3 pl-15 pr-4 text-left text-[14px] hover:bg-[#f5f5f5] sm:flex-row sm:items-center sm:justify-between sm:gap-2 ${
                        selectedCardIdx === idx ? "text-[#c90f45] font-semibold" : "text-[#333]"
                      }`}
                    >
                      {card.image_key && (
                        <div className="absolute left-4 top-1/2 h-5 w-9 -translate-y-1/2">
                          <Image src={imageUrl(card.image_key)} alt="" fill className="object-contain" unoptimized />
                        </div>
                      )}
                      <span className="break-keep">{card.name}</span>
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
              href={(() => {
                const params = new URLSearchParams();
                params.set("ids", String(product.id));
                params.set("period", selectedPeriod);
                if (selectedCareItem) params.set("care", selectedCareItem.label);
                if (selectedCard) params.set("cardId", String(selectedCard.id));
                if (hasColorItems) params.set("color", product.colorItems![selectedColorIdx].name);
                const qs = params.toString();
                return qs ? `/consult?${qs}` : "/consult";
              })()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c90f45] text-[15px] font-black text-white transition-opacity hover:opacity-90 sm:h-14 sm:text-[16px]"
            >
              <LuMessageCircle size={18} className="sm:hidden" />
              <LuMessageCircle size={20} className="hidden sm:block" />
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
                    dangerouslySetInnerHTML={{ __html: processedDetailHtml }}
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

      <SubscriptionBenefits />
    </main>
  );
}
