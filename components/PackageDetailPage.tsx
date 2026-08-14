"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { adminStore, imageUrl, type CardDiscount } from "@/lib/adminStore";
import type { ManagedProduct } from "@/lib/productStore";
import { type ProductBundle, bundleHeadline } from "@/lib/productBundles";
import { getPeriodPrices, getCareServiceItems, getColorItems, resolvePrice, intersectPeriodLabels } from "@/lib/productPricing";
import SubscriptionBenefits from "@/components/SubscriptionBenefits";
import { LuChevronRight, LuMessageCircle, LuImage, LuChevronDown } from "react-icons/lu";

type Props = {
  bundle: ProductBundle;
  products: ManagedProduct[];
  breadcrumb: { label: string; href: string }[];
};

type ItemSel = { careIdx: number; colorIdx: number };

function defaultSel(products: ManagedProduct[]): Record<string, ItemSel> {
  const map: Record<string, ItemSel> = {};
  products.forEach((p) => { map[p.id] = { careIdx: 0, colorIdx: 0 }; });
  return map;
}

export default function PackageDetailPage({ bundle, products, breadcrumb }: Props) {
  const [imgError, setImgError] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [sel, setSel] = useState<Record<string, ItemSel>>(() => defaultSel(products));
  const sharedPeriods = useMemo(() => intersectPeriodLabels(products), [products]);
  const [selectedPeriod, setSelectedPeriod] = useState(sharedPeriods[0] ?? "");
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [cards, setCards] = useState<CardDiscount[]>([]);

  useEffect(() => { adminStore.cardDiscounts.get().then(setCards); }, []);

  const activeProduct = products[activeTabIdx];
  const activeSel = sel[activeProduct.id] ?? { careIdx: 0, colorIdx: 0 };
  const careItems = getCareServiceItems(activeProduct);
  const colorItems = getColorItems(activeProduct);
  const selectedCard = selectedCardIdx !== null ? cards[selectedCardIdx] : null;

  useEffect(() => { setImgError(false); }, [activeTabIdx, activeSel.colorIdx]);

  const setCareIdx = (idx: number) =>
    setSel((prev) => ({ ...prev, [activeProduct.id]: { ...(prev[activeProduct.id] ?? { careIdx: 0, colorIdx: 0 }), careIdx: idx } }));
  const setColorIdx = (idx: number) =>
    setSel((prev) => ({ ...prev, [activeProduct.id]: { ...(prev[activeProduct.id] ?? { careIdx: 0, colorIdx: 0 }), colorIdx: idx } }));

  const displayImage = (colorItems.length > 0 && colorItems[activeSel.colorIdx]?.image) || activeProduct.image;

  const periodObj = getPeriodPrices(activeProduct).find((pp) => pp.label === selectedPeriod) ?? { label: selectedPeriod, price: 0 };
  const rawPrice = resolvePrice(careItems, periodObj, activeSel.careIdx);
  // 패키지 할인이 이미 반영된 금액을 상품별 이용요금으로 보여준다(정상가 별도 표기 없음).
  const itemPrice = rawPrice != null ? Math.round(rawPrice * (1 - bundle.discountPercent / 100)) : null;
  const cardPrice = selectedCard && itemPrice !== null ? Math.max(0, itemPrice - selectedCard.discount) : null;

  const title = bundleHeadline(bundle);

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
        </div>
      </div>

      <section className="mx-auto max-w-270 px-5 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-16">
          {/* 좌측: 메인 이미지 (활성 탭 상품 기준) */}
          <div className="mx-auto w-full max-w-90 sm:max-w-105 md:w-[42%] md:max-w-100 md:shrink-0 lg:w-[45%] lg:max-w-120">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
              {displayImage && !imgError ? (
                <Image
                  src={displayImage}
                  alt={activeProduct.name}
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

          {/* 우측 */}
          <div className="flex-1">
            <h1 className="mb-5 text-[20px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[24px]">{title}</h1>

            {/* 공통 계약기간 */}
            {sharedPeriods.length > 0 && (
              <div className="mb-1.5">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">공통 계약기간</p>
                <div className="flex gap-2">
                  {sharedPeriods.map((label) => (
                    <button key={label} type="button" onClick={() => setSelectedPeriod(label)} className="flex flex-1 items-center justify-center py-1">
                      <span
                        className={`flex w-full items-center justify-center rounded-md border py-1.5 text-[12px] font-semibold transition-colors sm:text-[14px] ${
                          selectedPeriod === label ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-[#e0e0e0] text-[#888] hover:border-[#999] hover:text-[#333]"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mb-5 text-[11px] text-[#aaa]">해당 패키지에 포함된 전체적인 계약기간이며 케어서비스와 무관한 항목입니다.</p>

            {/* 패키지 상품 탭 */}
            <div className="mb-5 flex gap-5 border-b border-[#e5e5e5]">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveTabIdx(i)}
                  className={`relative pb-3 text-[14px] font-bold transition-colors ${activeTabIdx === i ? "text-[#c90f45]" : "text-[#999] hover:text-[#555]"}`}
                >
                  패키지 상품 {i + 1}
                  {activeTabIdx === i && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#c90f45]" />}
                </button>
              ))}
            </div>

            {/* 활성 상품명/모델 */}
            <div className="mb-5">
              <h2 className="mb-1 text-[16px] font-black leading-[1.3] tracking-[-0.03em]">{activeProduct.name}</h2>
              <p className="text-[13px] text-[#aaa]">
                {activeProduct.model}{" "}
                <Link href={`/products/${activeProduct.section}/${activeProduct.id}`} className="text-[#c90f45] hover:underline">
                  자세히 보기 &gt;
                </Link>
              </p>
            </div>

            {/* 케어서비스 주기 */}
            {careItems.length > 0 && (
              <div className="mb-5">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">케어서비스 주기</p>
                <div className="flex gap-2">
                  {careItems.map((ci, i) => (
                    <button key={i} type="button" onClick={() => setCareIdx(i)} className="flex flex-1 items-center justify-center py-1">
                      <span
                        className={`flex w-full flex-col items-center justify-center rounded-md border px-1 py-1.5 transition-colors ${
                          activeSel.careIdx === i ? "border-[#1a1a1a]" : "border-[#e0e0e0] hover:border-[#999]"
                        }`}
                      >
                        <span className={`text-[12px] font-semibold sm:text-[14px] ${activeSel.careIdx === i ? "text-[#1a1a1a]" : "text-[#888]"}`}>{ci.label}</span>
                        {ci.cycle && <span className={`text-[11px] ${activeSel.careIdx === i ? "text-[#666]" : "text-[#aaa]"}`}>{ci.cycle}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 색상 (드롭다운) */}
            {colorItems.length > 0 && (
              <div className="mb-5">
                <p className="mb-1.5 text-[13px] font-semibold text-[#333]">색상</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-[13px] text-[#333] sm:px-4 sm:py-3 sm:text-[14px]"
                  >
                    <span className="truncate">{colorItems[activeSel.colorIdx]?.name ?? "선택"}</span>
                    <LuChevronDown size={16} className={`shrink-0 text-[#999] transition-transform ${colorOpen ? "rotate-180" : ""}`} />
                  </button>
                  {colorOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#e0e0e0] bg-white shadow-md">
                      {colorItems.map((ci, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setColorIdx(i); setColorOpen(false); }}
                          className={`block w-full px-4 py-3 text-left text-[13px] hover:bg-[#f5f5f5] ${activeSel.colorIdx === i ? "text-[#c90f45] font-semibold" : "text-[#333]"}`}
                        >
                          {ci.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 이용요금 */}
            <div className="mb-4 mt-6">
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-black text-[#1a1a1a]">이용요금</span>
                {itemPrice !== null ? (
                  <div className="flex flex-col gap-y-1">
                    {cardPrice !== null &&
                      (cardPrice > 0 ? (
                        <span className="text-[13px] font-semibold text-[#c90f45]">(제휴카드 이용시 월 {cardPrice.toLocaleString()}원)</span>
                      ) : (
                        <span className="text-[13px] font-semibold text-[#c90f45]">(제휴카드 할인 적용가는 상담 문의 시 안내드립니다)</span>
                      ))}
                    <span className="text-[14px] text-[#555] wrap-break-word">
                      <span className="text-[20px] font-black text-[#1a1a1a]">월 {itemPrice.toLocaleString()}</span>원
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
                      <span className={`shrink-0 ${selectedCardIdx === idx ? "text-[#c90f45]" : "text-[#888]"}`}>월 최대 -{card.discount.toLocaleString()}원</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 구독신청 버튼: 패키지 내 전 상품을 각자 선택값과 함께 제출 */}
            <Link
              href={(() => {
                const params = new URLSearchParams();
                params.set("ids", products.map((p) => String(p.id)).join(","));
                params.set("period", selectedPeriod);
                const selPayload = products.map((p) => {
                  const s = sel[p.id] ?? { careIdx: 0, colorIdx: 0 };
                  const ci = getCareServiceItems(p);
                  const co = getColorItems(p);
                  return { id: String(p.id), care: ci[s.careIdx]?.label, color: co[s.colorIdx]?.name };
                });
                params.set("sel", JSON.stringify(selPayload));
                if (selectedCard) params.set("cardId", String(selectedCard.id));
                params.set("note", `[${bundle.name} 패키지 할인 ${bundle.discountPercent}% 적용 요청]`);
                return `/consult?${params.toString()}`;
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

      <SubscriptionBenefits />
    </main>
  );
}
