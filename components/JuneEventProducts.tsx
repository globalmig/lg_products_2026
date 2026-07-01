"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adminStore, imageUrl, type EventPost } from "@/lib/adminStore";

function EventCard({ post }: { post: EventPost }) {
  const img = imageUrl(post.image_key);
  const card = (
    <div className="flex w-70 shrink-0 flex-col rounded-xl border border-[#e8e8e8] p-6 transition-colors sm:w-80 sm:p-7 group-hover:border-[#c90f45]">
      <div className="mb-4 overflow-hidden rounded-lg">
        {img ? (
          <Image
            src={img}
            alt={post.title}
            width={400}
            height={240}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ maxHeight: "200px" }}
            unoptimized
          />
        ) : (
          <div className="flex h-50 items-center justify-center bg-[#f5f5f5]">
            <span className="text-[13px] text-[#bbb]">이미지 준비중</span>
          </div>
        )}
      </div>
      <p className="line-clamp-1 text-[15px] font-bold tracking-tighter text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
        {post.title}
      </p>
      {post.subtitle && (
        <p className="mt-1 line-clamp-1 text-[13px] text-[#777]">{post.subtitle}</p>
      )}
      {post.created_at && (
        <p className="mt-2 text-[11px] text-[#bbb]">{post.created_at}</p>
      )}
    </div>
  );

  if (!post.link) return <div className="group block">{card}</div>;
  return post.link.startsWith("http") ? (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group block">
      {card}
    </a>
  ) : (
    <Link href={post.link} className="group block">
      {card}
    </Link>
  );
}

export default function JuneEventProducts() {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminStore.eventPosts.get().then((data) => {
      if (data.length > 0) setPosts(data);
    });
  }, []);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
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
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-semibold tracking-widest text-[#c90f45]">EVENT</p>
            <h2 className="text-[24px] sm:text-[28px] font-black tracking-tighter text-[#1a1a1a]">
              이달의 행사
            </h2>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
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
            <Link
              href="/benefit"
              className="shrink-0 rounded-full border border-[#e0e0e0] px-5 py-2 text-[13px] font-medium text-[#444] transition-colors hover:border-[#c90f45] hover:text-[#c90f45]"
            >
              전체 혜택 보기 →
            </Link>
          </div>
        </div>

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide" onScroll={updateButtons}>
          <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
            {posts.map((post) => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
