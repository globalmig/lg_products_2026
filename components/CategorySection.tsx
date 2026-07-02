"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    adminStore.mainCategories.get().then((data) => {
      if (data.length > 0) setItems(data);
    });
  }, []);

  // 자동 무한 스크롤 (복제된 목록의 절반 지점에서 이음매 없이 되감기)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += 0.5;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  // 마우스 드래그로 직접 스크롤 (터치는 overflow-x-auto가 기본 지원)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragged = false;
      pausedRef.current = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) {
        // 실제 드래그로 확정된 시점에만 포인터를 캡처한다.
        // pointerdown 시점에 바로 캡처하면 클릭 이벤트의 타겟이 el로 바뀌어
        // 자식 Link가 클릭 이벤트를 받지 못해 이동이 전혀 안 되는 문제가 있었다.
        if (!dragged) el.setPointerCapture(e.pointerId);
        dragged = true;
      }
      el.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      dragging = false;
      pausedRef.current = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <section className="border-b border-[#f1f1f1] bg-white py-10">
      <div className="mx-auto max-w-360 px-5">
        <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">
          카테고리
        </h2>
        <div
          ref={scrollRef}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          className="flex cursor-grab select-none gap-4 overflow-x-auto scrollbar-hide active:cursor-grabbing sm:gap-6"
        >
          {[...items, ...items].map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={item.href}
              draggable={false}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className="relative h-22 w-22 overflow-hidden rounded-full transition-shadow duration-200 group-hover:shadow-md sm:h-25 sm:w-25"
                style={{ backgroundColor: item.bg }}
              >
                <Image src={item.image} alt={item.label} fill sizes="100px"
                  className="pointer-events-none object-contain p-3 transition-transform duration-300 group-hover:scale-110" unoptimized />
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
