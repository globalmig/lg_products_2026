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
  careServiceItems?: { label: string; cycle: string }[];
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

function withResponsiveOverride(html: string): string {
  const style =
    "<style>img{max-width:100% !important;height:auto !important}" +
    '*[style*="860px"]{width:100% !important;max-width:860px !important}' +
    "html,body{max-width:100%;overflow-x:hidden}</style>";
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const idx = html.indexOf(headMatch[0]) + headMatch[0].length;
    return html.slice(0, idx) + style + html.slice(idx);
  }
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (bodyMatch) {
    const idx = html.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    return html.slice(0, idx) + style + html.slice(idx);
  }
  return style + html;
}

const benefits = [
  { Icon: LuWrench, title: "전문가 정기 점검", desc: "전문 매니저가 정기적으로 방문해 제품 상태를 점검·관리합니다." },
  { Icon: LuRefreshCw, title: "제품 업그레이드", desc: "약정 기간 후 최신 제품으로 업그레이드할 수 있습니다." },
  { Icon: LuShieldCheck, title: "완전 보장 서비스", desc: "사용 중 고장 시 무상 수리 또는 교체로 걱정 없이 사용하세요." },
  { Icon: LuTruck, title: "무료 배송·설치", desc: "전문 설치 기사가 무료로 배송 및 설치를 진행합니다." },
];

export default function ProductDetailPage({ product, breadcrumb, section }: Props) {
  const [imgError, setImgError] = useState(false);
  const hasPeriodPrices = (product.periodPrices?.length ?? 0) > 0;
  const defaultPeriod = hasPeriodPrices ? product.periodPrices![0].label : "72개월";
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedCareIdx, setSelectedCareIdx] = useState(0);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cards, setCards] = useState<CardDiscount[]>([]);

  useEffect(() => { adminStore.cardDiscounts.get().then(setCards); }, []);
  useEffect(() => { setImgError(false); }, [selectedColorIdx]);

  const selectedCard = selectedCardIdx !== null ? cards[selectedCardIdx] : null;

  const basePrice = (() => {
    if (hasPeriodPrices) {
      return product.periodPrices!.find((p) => p.label === selectedPeriod)?.price ?? product.monthlyPrice;
    }
    const m = parseInt(selectedPeriod);
    if (m === 60 && product.price60 != null) return product.price60;
    if (m === 48 && product.price48 != null) return product.price48;
    if (m === 36 && product.price36 != null) return product.price36;
    return product.monthlyPrice;
  })();

  const hasColorItems = (product.colorItems?.length ?? 0) > 0;
  const displayImage = (hasColorItems && product.colorItems![selectedColorIdx]?.image)
    ? product.colorItems![selectedColorIdx].image
    : product.image;

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
        <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-16">

          {/* 좌측: 메인 이미지 */}
          <div className="mx-auto w-full max-w-90 sm:max-w-105 md:w-[42%] md:max-w-100 md:shrink-0 lg:w-[45%] lg:max-w-120">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
              {!imgError ? (
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
            <h1 className="mb-1 text-[20px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[24px]">
              {product.name}
            </h1>
            <p className="mb-6 text-[14px] text-[#aaa]">{product.model}</p>

            {/* 계약기간 */}
            <div className="mb-5">
              <p className="mb-2 text-[13px] font-semibold text-[#333]">계약기간</p>
              <div className="grid grid-cols-4 gap-2">
                {(hasPeriodPrices
                  ? product.periodPrices!
                  : [72, 60, 48, 36].map((m) => ({ label: `${m}개월`, price: m === 72 ? product.monthlyPrice : m === 60 ? (product.price60 ?? product.monthlyPrice) : m === 48 ? (product.price48 ?? product.monthlyPrice) : (product.price36 ?? product.monthlyPrice) }))
                ).map((period) => (
                  <button
                    key={period.label}
                    type="button"
                    onClick={() => setSelectedPeriod(period.label)}
                    className={`rounded-lg border px-2 py-2.5 text-center text-[12px] font-semibold transition-colors sm:px-4 sm:py-3 sm:text-[14px] ${
                      selectedPeriod === period.label
                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                        : "border-[#e0e0e0] bg-white text-[#555] hover:border-[#999]"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 케어서비스 주기 */}
            {(product.careServiceItems?.length ?? 0) > 0 ? (
              <div className="mb-3">
                <p className="mb-2 text-[13px] font-semibold text-[#333]">케어서비스 주기</p>
                <div className="flex flex-wrap gap-2">
                  {product.careServiceItems!.map((cs, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCareIdx(i)}
                      className={`rounded-lg border px-3.5 py-2 text-left transition-colors sm:px-4 sm:py-2.5 ${
                        selectedCareIdx === i
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                          : "border-[#e0e0e0] bg-white text-[#555] hover:border-[#999]"
                      }`}
                    >
                      <span className="block text-[13px] font-semibold sm:text-[14px]">{cs.label}</span>
                      {cs.cycle && <span className={`block text-[12px] ${selectedCareIdx === i ? "text-white/70" : "text-[#999]"}`}>{cs.cycle}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (product.careService || product.manageCycle) ? (
              <div className="mb-3">
                <p className="mb-2 text-[13px] font-semibold text-[#333]">케어서비스 주기</p>
                <div className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] text-[#555]">
                  {product.careService}{product.manageCycle ? ` / ${product.manageCycle}` : ""}
                </div>
              </div>
            ) : null}

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

            {/* 이용요금 / 제휴카드가 */}
            <div className="mb-4 mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-black text-[#1a1a1a]">이용요금</span>
                <span className="text-[14px] text-[#555]">
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
            <div className="mb-6 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3.5 sm:px-4 sm:py-4">
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
                if (selectedCard) params.set("cardId", String(selectedCard.id));
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
                  /(<head[\s>]|<body[\s>]|<!doctype)/i.test(product.detailImage) ? (
                    <iframe
                      srcDoc={withResponsiveOverride(product.detailImage)}
                      className="w-full border-none block"
                      style={{ minHeight: 400, overflow: "hidden" }}
                      scrolling="no"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-forms allow-same-origin"
                      onLoad={(e) => {
                        try {
                          const frame = e.currentTarget;
                          const doc = frame.contentDocument;
                          const el = doc?.documentElement;
                          if (doc?.body) doc.body.style.overflow = "hidden";
                          if (el) {
                            el.style.overflow = "hidden";
                            frame.style.height = el.scrollHeight + "px";
                          }
                        } catch {}
                      }}
                    />
                  ) : (
                  <div
                    className="w-full detail-html-content"
                    dangerouslySetInnerHTML={{ __html: product.detailImage }}
                  />
                  )
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
