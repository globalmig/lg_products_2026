"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { productStore, type ManagedProduct } from "@/lib/productStore";
import CategoryFilterBar from "@/components/CategoryFilterBar";


/* ────── 상품 카드 ────── */
function ProductCard({ product }: { product: ManagedProduct }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a href={`/products/tv/${product.id}`} className="group flex flex-col">
      <div className="relative mb-3 overflow-hidden rounded-2xl bg-[#f7f7f7] aspect-square">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

      <div className="mb-1 flex min-h-4.5 items-center gap-1">
        {product.tags[0] && (
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${
              product.tags[0].type === "md"
                ? "bg-[#c90f45] text-white"
                : product.tags[0].type === "naver"
                ? "bg-[#03c75a] text-white"
                : "bg-[#fff0f3] text-[#c90f45]"
            }`}
          >
            {product.tags[0].label}
          </span>
        )}
        {product.tags.length > 1 && (
          <span className="inline-flex items-center rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[9px] font-bold text-[#999] sm:text-[10px]">
            +{product.tags.length - 1}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors line-clamp-2 min-h-[2.9em] sm:text-[14px] lg:text-[15px]">
        {product.name}
      </h3>
      <p className="mb-2 text-[10px] text-[#999] sm:text-[11px]">{product.model}</p>
      <p className="text-left text-[14px] font-bold text-[#1a1a1a] sm:text-[15px] lg:text-[16px]">월 {product.monthlyPrice.toLocaleString()}원</p>
      <div className="min-h-6">
        {product.benefitPrice !== null && (
          <p className="text-left text-[15px] font-bold text-[#c90f45] sm:text-[16px] lg:text-[17px]">
            최대혜택가 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
          </p>
        )}
      </div>
    </a>
  );
}

/* ────── 베스트 캐러셀 ────── */
function BestCarousel({ bestProducts }: { bestProducts: ManagedProduct[] }) {
  if (bestProducts.length === 0) return null;

  return (
    <section className="bg-[#f5f5f5] py-8 sm:py-10">
      <div className="mx-auto max-w-300 px-5">
        <h2 className="mb-6 text-[18px] font-black tracking-[-0.04em] text-[#1a1a1a] sm:text-[20px] lg:text-[22px]">TV 베스트</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {bestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────── 메인 컴포넌트 ────── */
export default function TVProductList() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    productStore.products.getBySection("tv").then(setProducts);
    productStore.categories.getBySection("tv").then((cats) => setCategories(cats.map((c) => c.name)));
  }, []);

  const toValid = (cat: string | null) =>
    cat && ["전체", ...categories].includes(cat) ? cat : "전체";

  const [activeCategory, setActiveCategory] = useState<string>("전체");

  useEffect(() => {
    setActiveCategory(toValid(searchParams.get("category")));
  }, [searchParams]);

  const filtered = useMemo(() => {
    return activeCategory === "전체" ? products : products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <>
      <BestCarousel bestProducts={products.filter((p) => p.isBest)} />

      <div className="mx-auto max-w-300 px-5 py-8 sm:py-10">
        <h2 className="mb-6 text-[18px] font-black tracking-[-0.04em] text-[#1a1a1a] sm:text-[20px] lg:text-[22px]">TV</h2>

        {/* 필터 */}
        <CategoryFilterBar categories={["전체", ...categories]} active={activeCategory} onChange={setActiveCategory} />

        {/* 상품 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
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
