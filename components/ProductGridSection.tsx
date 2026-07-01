"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type GridProduct = {
  id: number;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  image: string;
  tags: { label: string; type: string }[];
};

function ProductCard({ product, category }: { product: GridProduct; category: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a href={`/products/${category}/${product.id}`} className="group block">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[12px] text-[#bbb]">이미지 준비중</span>
          </div>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
        {product.name}
      </h3>
      <p className="mb-2 text-[11px] text-[#aaa]">{product.model}</p>
      <p className="text-[15px] font-bold text-[#1a1a1a]">
        월 {product.monthlyPrice.toLocaleString()}원
      </p>
      {product.benefitPrice !== null && (
        <p className="text-[13px] font-semibold text-[#c90f45]">
          최대혜택가 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
        </p>
      )}
      <div className="mt-2 flex min-h-4.5 flex-wrap gap-1">
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
    </a>
  );
}

type Props = {
  title: string;
  subtitle?: string;
  allHref: string;
  products: GridProduct[];
  category: string;
  bg?: string;
};

export default function ProductGridSection({ title, subtitle, allHref, products, category, bg = "bg-white" }: Props) {
  return (
    <section className={`${bg} border-b border-[#f1f1f1] py-12`}>
      <div className="mx-auto max-w-[1200px] px-5">
        {/* 헤더 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-[22px] font-black tracking-[-0.04em] text-[#1a1a1a]">{title}</h2>
            {subtitle && <p className="mt-1 text-[13px] text-[#888]">{subtitle}</p>}
          </div>
          <Link
            href={allHref}
            className="text-[13px] font-medium text-[#888] transition-colors hover:text-[#c90f45]"
          >
            전체보기 →
          </Link>
        </div>

        {/* 그리드 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
