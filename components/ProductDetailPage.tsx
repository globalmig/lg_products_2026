"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  LuChevronRight,
  LuWrench,
  LuRefreshCw,
  LuShieldCheck,
  LuTruck,
  LuCalendarDays,
  LuUserCheck,
  LuMessageCircle,
  LuImage,
} from "react-icons/lu";

export type DetailProduct = {
  id: string | number;
  category: string;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  image: string;
  detailImage?: string;
  detailImages?: string[];
  tags: { label: string; type: string }[];
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
];

const infoItems = [
  { Icon: LuCalendarDays, label: "약정 기간", value: "36개월" },
  { Icon: LuUserCheck, label: "서비스", value: "전문가 관리 포함" },
  { Icon: LuWrench, label: "설치", value: "전문 설치 기사" },
  { Icon: LuTruck, label: "배송", value: "무료 배송" },
];

export default function ProductDetailPage({ product, breadcrumb, section }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 브레드크럼 */}
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-3">
        <div className="mx-auto flex max-w-[1080px] items-center gap-1 text-[12px] text-[#999]">
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
      <section className="mx-auto max-w-[1080px] px-5 py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* 좌측: 메인 이미지 */}
          <div className="lg:w-[460px] lg:shrink-0">
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
                className="absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full text-center text-[10px] font-bold leading-[1.3] text-white"
                style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
              >
                LG전자<br />온라인<br />인증점
              </div>
            </div>
          </div>

          {/* 우측: 상품 정보 */}
          <div className="flex-1">
            {/* 카테고리 + 태그 */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[12px] font-semibold text-[#666]">
                {product.category}
              </span>
              {product.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`rounded px-2 py-0.5 text-[11px] font-bold ${
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

            <h1 className="mb-2 text-[22px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[26px]">
              {product.name}
            </h1>
            <p className="mb-6 text-[13px] text-[#aaa]">모델번호: {product.model}</p>

            {/* 가격 박스 */}
            <div className="mb-6 rounded-2xl bg-[#fafafa] px-6 py-5">
              <p className="mb-1 text-[13px] text-[#888]">월 구독료</p>
              <p className="text-[32px] font-black tracking-[-0.04em] text-[#1a1a1a]">
                {product.monthlyPrice.toLocaleString()}
                <span className="text-[18px] font-bold">원/월</span>
              </p>
              {product.benefitPrice !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-[#fff0f3] px-2 py-0.5 text-[11px] font-bold text-[#c90f45]">최대혜택가</span>
                  <p className="text-[18px] font-bold text-[#c90f45]">
                    월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
                  </p>
                </div>
              )}
            </div>

            {/* 구독 정보 그리드 */}
            <div className="mb-8 grid grid-cols-2 gap-3">
              {infoItems.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] px-4 py-3">
                  <Icon size={16} className="shrink-0 text-[#c90f45]" />
                  <div>
                    <p className="text-[11px] text-[#aaa]">{label}</p>
                    <p className="text-[13px] font-semibold text-[#333]">{value}</p>
                  </div>
                </div>
              ))}
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
        <div className="mx-auto max-w-[1080px]">
          <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em]">상품 상세</h2>

          {(product.detailImage || (product.detailImages && product.detailImages.length > 0)) ? (
            <div className="flex flex-col gap-2">
              {product.detailImage && (
                <div className="relative w-full overflow-hidden rounded-xl">
                  <Image src={product.detailImage} alt={`${product.name} 상세이미지`} width={1080} height={600} className="w-full object-cover" unoptimized />
                </div>
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
        <div className="mx-auto max-w-[1080px]">
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
