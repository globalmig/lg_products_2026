"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productStore, SECTION_LABELS, type ManagedProduct, type Section } from "@/lib/productStore";

const SECTIONS: { key: Section; href: string }[] = [
  { key: "kitchen", href: "/products/kitchen" },
  { key: "air",     href: "/products/air" },
  { key: "living",  href: "/products/living" },
  { key: "tv",      href: "/products/tv" },
];


function ProductCard({ product, href }: { product: ManagedProduct; href: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`${href}/${product.id}`} className="group flex w-48 shrink-0 flex-col" draggable={false}>
      <div className="relative mb-2.5 aspect-square overflow-hidden rounded-xl bg-[#f7f7f7]">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="192px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-[#ccc]">이미지 준비중</div>
        )}
      </div>

      <div className="mb-1 flex min-h-4.5 flex-wrap gap-1">
        {product.tags.slice(0, 2).map((tag) => (
          <span
            key={tag.label}
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold leading-none ${
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

      <p className="mb-1 line-clamp-2 text-[12px] font-semibold leading-[1.4] tracking-[-0.02em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors min-h-[2.8em]">
        {product.name}
      </p>
      <p className="text-[13px] font-bold text-[#1a1a1a]">
        월 {product.monthlyPrice.toLocaleString()}원
      </p>
      {product.benefitPrice !== null && (
        <p className="text-[11px] font-semibold text-[#c90f45]">
          최대혜택 월 {product.benefitPrice === 0 ? "0" : product.benefitPrice.toLocaleString()}원
        </p>
      )}
    </Link>
  );
}

const SCROLL_STEP = 208 * 3; // 카드 3개 너비씩 이동

function SectionSlider({ sectionKey, href }: { sectionKey: Section; href: string }) {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productStore.products.getBySection(sectionKey).then((list) => {
      const best = list.filter((p) => p.isBest);
      setProducts((best.length > 0 ? best : list).slice(0, 10));
    });
  }, [sectionKey]);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? SCROLL_STEP : -SCROLL_STEP, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between px-5 lg:px-0">
        <h2 className="text-[18px] font-black tracking-[-0.04em] text-[#1a1a1a] sm:text-[20px]">
          {SECTION_LABELS[sectionKey]}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!canPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll("next")}
              disabled={!canNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30"
            >
              ›
            </button>
          </div>
          <Link href={href} className="text-[12px] font-semibold text-[#888] hover:text-[#c90f45] transition-colors">
            전체보기 ›
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        onScroll={updateButtons}
      >
        <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} href={href} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeProductSections() {
  return (
    <section className="border-t border-[#f1f1f1] py-10">
      <div className="mx-auto max-w-360 space-y-12 lg:px-5">
        {SECTIONS.map(({ key, href }) => (
          <SectionSlider key={key} sectionKey={key} href={href} />
        ))}
      </div>
    </section>
  );
}
