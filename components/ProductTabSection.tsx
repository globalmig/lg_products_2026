"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productStore, type ManagedProduct } from "@/lib/productStore";

const TABS = [
  { label: "주방가전", key: "kitchen" as const, href: "/products/kitchen" },
  { label: "TV",      key: "tv"      as const, href: "/products/tv" },
];

function ProductCard({ product, category }: { product: ManagedProduct; category: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a href={`/products/${category}/${product.id}`} className="group block">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#f7f7f7]">
        {!imgError && product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
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
          className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full text-center text-[8px] font-bold leading-[1.3] text-white"
          style={{ background: "radial-gradient(circle at 40% 35%, #e8437a, #c90f45 60%, #8b0030)" }}
        >
          LG전자<br />온라인<br />인증점
        </div>
      </div>
      <h3 className="mb-1 line-clamp-2 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
        {product.name}
      </h3>
      <p className="mb-2 text-[11px] text-[#aaa]">{product.model}</p>
      <p className="text-[15px] font-bold text-[#1a1a1a]">월 {product.monthlyPrice.toLocaleString()}원</p>
      {product.benefitPrice !== null && (
        <p className="text-[13px] font-semibold text-[#c90f45]">
          최대혜택가 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
        </p>
      )}
      {product.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
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
    </a>
  );
}

export default function ProductTabSection() {
  const [activeTab, setActiveTab] = useState<"kitchen" | "tv">("kitchen");
  const [products, setProducts] = useState<ManagedProduct[]>([]);

  useEffect(() => {
    productStore.products.getBySection(activeTab).then(setProducts);
  }, [activeTab]);

  const current = TABS.find((t) => t.key === activeTab)!;

  return (
    <section className="border-b border-[#f1f1f1] bg-white py-12">
      <div className="mx-auto max-w-300 px-5">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-5 py-2 text-[14px] font-bold transition-colors ${
                  activeTab === tab.key ? "bg-[#1a1a1a] text-white" : "text-[#888] hover:text-[#1a1a1a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link href={current.href} className="text-[13px] font-medium text-[#888] transition-colors hover:text-[#c90f45]">
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} category={activeTab} />
          ))}
        </div>
      </div>
    </section>
  );
}
