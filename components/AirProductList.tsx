"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { productStore, type ManagedProduct } from "@/lib/productStore";

const SORT_OPTIONS = [
  { label: "- 정렬방식 -", value: "default" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
];

function ProductCard({ product }: { product: ManagedProduct }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a href={`/products/air/${product.id}`} className="group block">
      <div className="relative mb-3 overflow-hidden rounded-2xl bg-[#f7f7f7] aspect-square">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
          className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full text-center text-[9px] font-bold leading-[1.3] text-white"
          style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
        >
          LG전자
          <br />
          온라인
          <br />
          인증점
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="mb-2 text-[11px] text-[#999]">{product.model}</p>
        <p className="text-[15px] font-bold text-[#1a1a1a]">월 {product.monthlyPrice.toLocaleString()}원</p>
        {product.benefitPrice !== null && (
          <p className="text-[13px] font-semibold text-[#c90f45]">
            최대혜택가 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
          </p>
        )}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  tag.type === "md"
                    ? "bg-[#c90f45] text-white"
                    : tag.type === "naver"
                    ? "bg-[#03c75a] text-white"
                    : "bg-[#fff0f3] text-[#c90f45]"
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

function BestCarousel({ bestProducts }: { bestProducts: ManagedProduct[] }) {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(bestProducts.length - 4, 0);

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));

  if (bestProducts.length === 0) return null;

  return (
    <section className="bg-[#f5f5f5] py-10">
      <div className="mx-auto max-w-270 px-5">
        <h2 className="mb-6 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">에어컨/에어케어 베스트</h2>
        <div className="relative">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="absolute -left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd] bg-white shadow-sm transition-opacity disabled:opacity-30"
            aria-label="이전"
          >
            <svg className="h-4 w-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300"
              style={{ transform: `translateX(calc(-${index} * (25% + 4px)))` }}
            >
              {bestProducts.map((product) => (
                <div key={product.id} className="w-[calc(25%-12px)] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            disabled={index >= maxIndex}
            className="absolute -right-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd] bg-white shadow-sm transition-opacity disabled:opacity-30"
            aria-label="다음"
          >
            <svg className="h-4 w-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function AirProductList() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    setProducts(productStore.products.getBySection("air"));
    setCategories(productStore.categories.getBySection("air").map((c) => c.name));
  }, []);

  const toValid = (cat: string | null) =>
    cat && ["전체", ...categories].includes(cat) ? cat : "전체";

  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setActiveCategory(toValid(searchParams.get("category")));
  }, [searchParams, categories]);

  const filtered = useMemo(() => {
    let list =
      activeCategory === "전체"
        ? products
        : products.filter((p) => p.category === activeCategory);

    if (sort === "price_asc") list = [...list].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.monthlyPrice - a.monthlyPrice);

    return list;
  }, [activeCategory, sort, products]);

  return (
    <>
      <BestCarousel bestProducts={products.filter((p) => p.isBest)} />

      <div className="mx-auto max-w-270 px-5 py-10">
        <h2 className="mb-6 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">에어컨/에어케어</h2>

        {/* 필터 */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["전체", ...categories].map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                    : "border-[#d8d8d8] bg-white text-[#555] hover:border-[#555]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 정렬 */}
        <div className="mb-8 flex justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-[#d8d8d8] bg-white px-4 py-1.5 text-[13px] text-[#555] outline-none cursor-pointer hover:border-[#555]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-[14px] text-[#999]">해당 카테고리의 상품이 없습니다.</div>
        )}
      </div>
    </>
  );
}
