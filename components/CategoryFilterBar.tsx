"use client";

import { useEffect, useRef, useState } from "react";

export default function CategoryFilterBar({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateFade = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => { updateFade(); }, [categories]);

  return (
    <div className="relative mb-3">
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
      )}
      <div ref={scrollRef} onScroll={updateFade} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap sm:px-4 sm:text-[13px] ${
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
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
      )}
    </div>
  );
}
