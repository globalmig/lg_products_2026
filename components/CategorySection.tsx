"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { adminStore, type MainCategoryItem } from "@/lib/adminStore";

const DEFAULT_ITEMS: MainCategoryItem[] = [
  { id: "c1",  label: "냉장고",    href: "/products/kitchen?category=냉장고",    image: "/images/icon/3D/box.png",      bg: "#f5ede8", sort_order: 0 },
  { id: "c2",  label: "김치냉장고", href: "/products/kitchen?category=김치냉장고", image: "/images/icon/3D/coin.png",     bg: "#edf2f0", sort_order: 1 },
  { id: "c3",  label: "식기세척기", href: "/products/kitchen?category=식기세척기", image: "/images/icon/3D/house.png",    bg: "#eef2f8", sort_order: 2 },
  { id: "c4",  label: "광파오븐",   href: "/products/kitchen?category=광파오븐",   image: "/images/icon/3D/timeCoin.png", bg: "#f5f2e8", sort_order: 3 },
  { id: "c5",  label: "스탠바이미", href: "/products/tv?category=스탠바이미",      image: "/images/icon/3D/new.png",      bg: "#edf0f5", sort_order: 4 },
  { id: "c6",  label: "OLED TV",   href: "/products/tv?category=OLED",            image: "/images/icon/3D/saleTag.png",  bg: "#f0edf5", sort_order: 5 },
  { id: "c7",  label: "세탁기",     href: "/products/living?category=세탁기",      image: "/images/icon/3D/return.png",   bg: "#edf5f5", sort_order: 6 },
  { id: "c8",  label: "워시타워",   href: "/products/living?category=워시타워",    image: "/images/icon/3D/Wallet.png",   bg: "#f0f5ee", sort_order: 7 },
  { id: "c9",  label: "스타일러",   href: "/products/living?category=스타일러",    image: "/images/icon/3D/clip.png",     bg: "#f5eef2", sort_order: 8 },
  { id: "c10", label: "청소기",     href: "/products/living?category=청소기",      image: "/images/icon/3D/plus.png",     bg: "#f2f0eb", sort_order: 9 },
  { id: "c11", label: "에어컨",     href: "/products/air?category=에어컨",         image: "/images/icon/3D/truck.png",    bg: "#eaf2f8", sort_order: 10 },
  { id: "c12", label: "공기청정기", href: "/products/air?category=공기청정기",     image: "/images/icon/3D/gift.png",     bg: "#eef5ee", sort_order: 11 },
  { id: "c13", label: "안마의자",   href: "/products/living?category=안마의자",    image: "/images/icon/3D/calendar.png", bg: "#f5ede8", sort_order: 12 },
];

export default function CategorySection() {
  const [items, setItems] = useState<MainCategoryItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    adminStore.mainCategories.get().then((data) => {
      if (data.length > 0) setItems(data);
    });
  }, []);

  return (
    <section className="border-b border-[#f1f1f1] bg-white py-10">
      <div className="mx-auto max-w-300 px-5">
        <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">
          카테고리
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:gap-6 lg:grid lg:grid-cols-7 lg:gap-x-2 lg:gap-y-6 lg:justify-items-center lg:overflow-visible lg:pb-0">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group flex shrink-0 flex-col items-center gap-2">
              <div
                className="relative h-22 w-22 overflow-hidden rounded-full transition-shadow duration-200 group-hover:shadow-md sm:h-25 sm:w-25"
                style={{ backgroundColor: item.bg }}
              >
                <Image src={item.image} alt={item.label} fill sizes="100px"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-110" unoptimized />
              </div>
              <span className="text-[12px] font-medium tracking-[-0.02em] text-[#333] group-hover:text-[#c90f45] sm:text-[13px]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
