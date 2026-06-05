"use client";

import { useState } from "react";
import Image from "next/image";
import { kitchenProducts } from "@/data/kitchenProducts";
import { tvProducts } from "@/data/tvProducts";

type Product = {
  id: string;
  href: string;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  image: string;
  tags: { label: string; type: string }[];
};

const baseProducts: Product[] = [
  ...tvProducts.slice(0, 6).map((p) => ({ ...p, id: `tv-${p.id}`, href: `/products/tv/${p.id}` })),
  ...kitchenProducts.slice(0, 6).map((p) => ({ ...p, id: `k-${p.id}`, href: `/products/kitchen/${p.id}` })),
];

// 무한 루프용 2배 복제
const loopProducts = [...baseProducts, ...baseProducts];

const CARD_WIDTH = 220;
const CARD_GAP = 16;

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={product.href}
      className="group block shrink-0"
      style={{ width: CARD_WIDTH }}
    >
      <div className="relative mb-3 overflow-hidden rounded-xl bg-[#f7f7f7]" style={{ width: CARD_WIDTH, height: CARD_WIDTH }}>
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="220px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[12px] text-[#bbb]">이미지 준비중</span>
          </div>
        )}
        <div
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-center text-[8px] font-bold leading-[1.3] text-white"
          style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
        >
          LG전자
          <br />온라인
          <br />인증점
        </div>
      </div>

      <div style={{ width: CARD_WIDTH }}>
        <h3 className="mb-1 line-clamp-2 text-[12px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
          {product.name}
        </h3>
        <p className="mb-1 text-[10px] text-[#aaa]">{product.model}</p>
        <p className="text-[14px] font-bold text-[#1a1a1a]">
          월 {product.monthlyPrice.toLocaleString()}원
        </p>
        {product.benefitPrice !== null && (
          <p className="text-[12px] font-semibold text-[#c90f45]">
            최대혜택가 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
          </p>
        )}
        {product.tags.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {product.tags.slice(0, 2).map((tag) => (
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
      </div>
    </a>
  );
}

export default function ProductCardSlider() {
  const trackWidth = loopProducts.length * (CARD_WIDTH + CARD_GAP);

  return (
    <>
      <style>{`
        @keyframes carousel-slide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: carousel-slide 35s linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="overflow-hidden border-b border-[#f1f1f1] bg-white py-10">
        <div className="mx-auto mb-6 flex max-w-300 items-center justify-between px-5">
          <h2 className="text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">
            이달의 추천 상품
          </h2>
          <a
            href="/products/kitchen"
            className="text-[13px] font-medium text-[#888] transition-colors hover:text-[#c90f45]"
          >
            전체보기 →
          </a>
        </div>

        <div className="overflow-hidden">
          <div
            className="carousel-track flex"
            style={{ width: trackWidth, gap: CARD_GAP }}
          >
            {loopProducts.map((product, i) => (
              <ProductCard key={`${product.id}-${i}`} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
