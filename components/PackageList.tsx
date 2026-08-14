"use client";

import { useState } from "react";
import Image from "next/image";
import type { ManagedProduct } from "@/lib/productStore";
import { type ProductBundle, bundleHeadline } from "@/lib/productBundles";
import { getPeriodPrices, getCareServiceItems, resolvePrice, intersectPeriodLabels } from "@/lib/productPricing";
import { imageUrl } from "@/lib/adminStore";

type BundleWithProducts = { bundle: ProductBundle; products: ManagedProduct[] };

// 목록 카드에 노출할 대표 가격: 상품별 첫 번째 케어서비스 기준, 공통 계약기간 중
// 가장 긴 기간의 가격을 합산 후 패키지 할인율을 적용한다.
function representativePrice({ bundle, products }: BundleWithProducts): number | null {
  const period = intersectPeriodLabels(products)[0];
  if (!period) return null;
  let total = 0;
  for (const p of products) {
    const periodObj = getPeriodPrices(p).find((pp) => pp.label === period) ?? { label: period, price: 0 };
    const price = resolvePrice(getCareServiceItems(p), periodObj, 0);
    if (price == null) return null;
    total += price;
  }
  return Math.round(total * (1 - bundle.discountPercent / 100));
}

function PackageCard({ bundle, products }: BundleWithProducts) {
  const [imgError, setImgError] = useState(false);
  const image = bundle.thumbnailKey ? imageUrl(bundle.thumbnailKey) : products[0]?.image ?? "";
  const price = representativePrice({ bundle, products });

  return (
    <a href={`/event/${bundle.id}`} className="group flex flex-col">
      <div className="relative mb-3 overflow-hidden rounded-2xl bg-[#f7f7f7] aspect-square">
        {image && !imgError ? (
          <Image
            src={image}
            alt={bundle.name}
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
        <span className="inline-flex items-center rounded bg-[#c90f45] px-1.5 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
          {bundle.discountPercent}% 할인
        </span>
        <span className="inline-flex items-center rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[9px] font-bold text-[#999] sm:text-[10px]">
          {products.length}종 패키지
        </span>
      </div>

      <h3 className="mb-1 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors line-clamp-2 min-h-[2.9em] sm:text-[14px] lg:text-[15px]">
        {bundleHeadline(bundle)}
      </h3>
      <p className="mb-2 text-[10px] text-[#999] sm:text-[11px]">{products.map((p) => p.name).join(" + ")}</p>
      {price !== null ? (
        <p className="text-left text-[15px] font-bold text-[#c90f45] sm:text-[16px] lg:text-[17px]">월 {price.toLocaleString()}원</p>
      ) : (
        <p className="text-left text-[13px] font-semibold text-[#c90f45]">상담 문의 시 안내</p>
      )}
    </a>
  );
}

export default function PackageList({ bundles }: { bundles: BundleWithProducts[] }) {
  if (bundles.length === 0) {
    return <div className="py-24 text-center text-[14px] text-[#999]">등록된 기획전 패키지가 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
      {bundles.map((bw) => (
        <PackageCard key={bw.bundle.id} bundle={bw.bundle} products={bw.products} />
      ))}
    </div>
  );
}
