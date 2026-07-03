"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { slides as defaultSlides, type Slide } from "@/data/slides";
import { adminStore, imageUrl } from "@/lib/adminStore";

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [mobileImages, setMobileImages] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplaySuspended, setAutoplaySuspended] = useState(false);
  const total = slides.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    adminStore.slides.get().then((data) => {
      if (data.length > 0) setSlides(data);
    });
    adminStore.siteSettings.get().then((s) => {
      if (s.heroMobileImages) setMobileImages(s.heroMobileImages);
    });
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    isProgrammaticScroll.current = true;
    container.scrollTo({ left: container.clientWidth * index, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || autoplaySuspended) return;
    const id = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % total;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [paused, autoplaySuspended, total]);

  const go = (index: number) => {
    const next = (index + total) % total;
    setCurrent(next);
    scrollToIndex(next);
  };

  // 사용자가 직접 드래그/스와이프로 스크롤한 경우를 감지해 current를 동기화하고
  // 잠시 자동재생을 멈췄다가 다시 재개한다. 프로그래밍 방식 스크롤(scrollToIndex)로
  // 발생한 scroll 이벤트는 isProgrammaticScroll 플래그로 구분해 무시한다.
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    if (isProgrammaticScroll.current) {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 200);
      return;
    }

    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setAutoplaySuspended(true);
    resumeTimer.current = setTimeout(() => setAutoplaySuspended(false), 4000);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setCurrent((c) => (c === index ? c : index));
    }, 100);
  };

  // 마우스 드래그로 좌우 스크롤 (카테고리 섹션과 동일한 방식, 터치는 overflow-x-auto가 기본 지원)
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
      startX = e.clientX;
      startScroll = el.scrollLeft;
      // scroll-smooth(scroll-behavior)와 snap-mandatory(scroll-snap-type)가 켜져 있으면
      // 드래그 중 scrollLeft를 바꿔도 애니메이션 지연/스냅 때문에 마우스를 그대로 따라오지 못하고
      // 슬라이드 폭만큼 훅 튀어버린다. 드래그하는 동안은 둘 다 꺼서 1:1로 따라오게 한다.
      el.style.scrollBehavior = "auto";
      el.style.scrollSnapType = "none";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) {
        // 실제 드래그로 확정된 시점에만 포인터를 캡처한다.
        // pointerdown 시점에 바로 캡처하면 클릭 이벤트의 타겟이 el로 바뀌어
        // 슬라이드의 링크(a 태그)가 클릭 이벤트를 받지 못하는 문제가 있었다.
        if (!dragged) el.setPointerCapture(e.pointerId);
        dragged = true;
      }
      el.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      dragging = false;
      el.style.scrollBehavior = "";
      el.style.scrollSnapType = "";
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
    <section className="relative w-full overflow-hidden aspect-16/7">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide flex h-full w-full cursor-grab select-none snap-x snap-mandatory overflow-x-auto scroll-smooth active:cursor-grabbing"
      >
        {slides.map((s, i) => {
          const mobileSrc = imageUrl(mobileImages[String(s.id)]) || s.image;
          const image = (
            <>
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                draggable={false}
                className="pointer-events-none hidden object-cover object-top min-[861px]:block"
              />
              <Image
                src={mobileSrc}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                draggable={false}
                className="pointer-events-none object-cover object-top min-[861px]:hidden"
              />
            </>
          );
          return (
            <div key={s.id} className="relative h-full w-full flex-none snap-center">
              {s.link ? (
                <a href={s.link} target="_blank" rel="noopener noreferrer" draggable={false} className="absolute inset-0 block">
                  {image}
                </a>
              ) : (
                image
              )}

              <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-270 items-center px-5">
                <div className="mb-4 sm:mb-6 md:mb-10">
                  <p className="mb-2 sm:mb-4 text-[16px] sm:text-[22px] md:text-[31px] font-medium tracking-tighter">
                    {s.subtitle}
                  </p>
                  <h1 className="whitespace-pre-line text-[28px] sm:text-[40px] md:text-[56px] font-black leading-[1.12] tracking-[-0.07em]">
                    {s.title}
                  </h1>
                  {s.description && (
                    <p className="mt-3 sm:mt-5 whitespace-pre-line text-[13px] sm:text-[15px] md:text-[18px] font-medium leading-relaxed tracking-[-0.03em] opacity-80">
                      {s.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
