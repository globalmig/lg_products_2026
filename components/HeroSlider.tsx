"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { slides as defaultSlides, type Slide } from "@/data/slides";
import { adminStore } from "@/lib/adminStore";

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    adminStore.slides.get().then((data) => {
      if (data.length > 0) setSlides(data);
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 4000);
    return () => clearInterval(id);
  }, [paused, total]);

  const go = (index: number) => {
    setCurrent((index + total) % total);
  };

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden aspect-[3/2] sm:aspect-[16/9] md:[aspect-ratio:16/7]">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => go(current - 1)}
        className="absolute left-8 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[24px] font-light text-[#888] shadow-sm md:flex"
        aria-label="이전 배너"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(current + 1)}
        className="absolute right-8 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[24px] font-light text-[#888] shadow-sm md:flex"
        aria-label="다음 배너"
      >
        ›
      </button>

      <div className="relative z-10 mx-auto flex h-full max-w-270 items-center px-5">
        <div className="mb-4 sm:mb-6 md:mb-10">
          <p className="mb-2 sm:mb-4 text-[16px] sm:text-[22px] md:text-[31px] font-medium tracking-tighter">
            {slide.subtitle}
          </p>
          <h1 className="whitespace-pre-line text-[28px] sm:text-[40px] md:text-[56px] font-black leading-[1.12] tracking-[-0.07em]">
            {slide.title}
          </h1>
          {slide.description && (
            <p className="mt-3 sm:mt-5 whitespace-pre-line text-[13px] sm:text-[15px] md:text-[18px] font-medium leading-relaxed tracking-[-0.03em] opacity-80">
              {slide.description}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        <span className="text-[10px] font-medium text-[#f1b7a1]">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`${i + 1}번 배너`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "h-2 w-7 bg-[#c90f45]" : "h-1 w-1 bg-[#d9eff4]"
            }`}
          />
        ))}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#9a9a9a]"
          aria-label={paused ? "배너 재생" : "배너 일시정지"}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      </div>
    </section>
  );
}
