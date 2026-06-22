"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adminStore } from "@/lib/adminStore";
import { productStore, type ManagedProduct } from "@/lib/productStore";

const TAG_STYLE: Record<string, string> = {
  hot: "bg-[#fff0f3] text-[#c90f45]",
  md: "bg-[#f0f4ff] text-[#3a6eff]",
  naver: "bg-[#e9fbe9] text-[#03c75a]",
};

export default function JuneEventProducts() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);

  useEffect(() => {
    Promise.all([productStore.products.get(), adminStore.eventProducts.get()]).then(([allProducts, refs]) => {
      const matched = refs
        .map((ref) => allProducts.find((p) => p.id === ref.product_id))
        .filter((p): p is ManagedProduct => p !== undefined);
      setProducts(matched);
    });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-360 px-5">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-semibold tracking-widest text-[#c90f45]">
              6월 한정 특가
            </p>
            <h2 className="text-[24px] sm:text-[28px] font-black tracking-tighter text-[#1a1a1a]">
              이달의 행사 제품
            </h2>
            <p className="mt-1.5 text-[14px] text-[#777]">
              6월 한 달간 진행되는 특별 할인 혜택 제품을 만나보세요
            </p>
          </div>
          <Link
            href="/benefit"
            className="self-start sm:self-auto shrink-0 rounded-full border border-[#e0e0e0] px-5 py-2 text-[13px] font-medium text-[#444] transition-colors hover:border-[#c90f45] hover:text-[#c90f45]"
          >
            전체 혜택 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-5">
          {products.map((product) => {
            const sectionMap: Record<string, string> = { kitchen: "kitchen", tv: "tv", air: "air", living: "living" };
            const href = `/products/${sectionMap[product.section] ?? product.section}/${product.id}`;

            return (
              <Link key={product.id} href={href} className="group block">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[12px] text-[#bbb]">이미지 준비중</div>
                  )}
                  <div
                    className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full text-center text-[7px] sm:text-[8px] font-bold leading-[1.3] text-white"
                    style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
                  >
                    LG전자<br />온라인<br />인증점
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span key={tag.label} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TAG_STYLE[tag.type] ?? "bg-[#f5f5f5] text-[#666]"}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mb-0.5 text-[11px] text-[#aaa]">{product.category}</p>
                <h3 className="mb-2 line-clamp-2 text-[12px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
                  {product.name}
                </h3>

                {product.benefitPrice !== null && product.benefitPrice > 0 ? (
                  <div>
                    <p className="text-[11px] text-[#bbb] line-through">월 {product.monthlyPrice.toLocaleString()}원</p>
                    <p className="text-[15px] font-black text-[#c90f45]">월 {product.benefitPrice.toLocaleString()}원</p>
                  </div>
                ) : (
                  <p className="text-[15px] font-black text-[#1a1a1a]">월 {product.monthlyPrice.toLocaleString()}원</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
