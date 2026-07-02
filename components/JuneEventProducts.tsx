"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuChevronLeft, LuChevronRight, LuArrowRight } from "react-icons/lu";
import { adminStore, type Post } from "@/lib/adminStore";

function EventCard({ post }: { post: Post }) {
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const preview = post.content.replace(/[#*>\-|]/g, "").trim().slice(0, 70);

  return (
    <Link
      href={`/benefit/${post.id}`}
      className="group flex w-72 shrink-0 flex-col rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c90f45] hover:shadow-lg sm:w-86 sm:p-7"
    >
      {date && <p className="text-[13px] font-semibold text-[#999]">{date}</p>}
      <p className="mt-2 line-clamp-2 break-keep text-[17px] font-black leading-snug tracking-tighter text-[#1a1a1a] transition-colors group-hover:text-[#c90f45] sm:text-[18px]">
        {post.title}
      </p>
      <p className="mt-3 line-clamp-3 break-keep text-[13px] leading-relaxed text-[#777]">{preview}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#c90f45] opacity-0 transition-opacity group-hover:opacity-100">
        자세히 보기 <LuArrowRight size={12} />
      </span>
    </Link>
  );
}

export default function JuneEventProducts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [progress, setProgress] = useState({ left: 0, width: 100 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminStore.posts.get("benefit").then((data) => {
      if (data.length > 0) setPosts(data);
    });
  }, []);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);

    const trackWidth = Math.max(el.scrollWidth, 1);
    const thumbWidth = Math.min((el.clientWidth / trackWidth) * 100, 100);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const thumbLeft = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - thumbWidth) : 0;
    setProgress({ left: thumbLeft, width: thumbWidth });
  };

  useEffect(() => { updateButtons(); }, [posts]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const track = el.firstElementChild as HTMLElement | null;
    const card = track?.firstElementChild as HTMLElement | null;
    const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 16 : 16;
    const step = card ? (card.offsetWidth + gap) * 2 : 600;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  if (posts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-360 px-5">
        <div className="mb-8">
          <p className="mb-2 text-[13px] font-semibold tracking-widest text-[#c90f45]">EVENT</p>
          <h2 className="text-[24px] sm:text-[28px] font-black tracking-tighter text-[#1a1a1a]">
            이달의 행사
          </h2>
        </div>

        <div className="mb-6 flex items-center justify-end gap-3">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!canPrev}
              aria-label="이전 행사"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30"
            >
              <LuChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll("next")}
              disabled={!canNext}
              aria-label="다음 행사"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
          <Link
            href="/benefit"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e0e0e0] px-5 py-2 text-[13px] font-medium text-[#444] transition-colors hover:border-[#c90f45] hover:text-[#c90f45]"
          >
            전체 혜택 보기 <LuArrowRight size={13} />
          </Link>
        </div>

        <div ref={scrollRef} className="overflow-x-auto scroll-smooth scrollbar-hide" onScroll={updateButtons}>
          <div className="flex gap-4 pb-2 sm:gap-5" style={{ width: "max-content" }}>
            {posts.map((post) => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {posts.length > 1 && (
          <div className="mx-auto mt-6 h-1 max-w-50 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div
              className="h-full rounded-full bg-[#c90f45] transition-[left,width] duration-300"
              style={{ width: `${progress.width}%`, marginLeft: `${progress.left}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
