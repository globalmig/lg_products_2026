"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adminStore, imageUrl, type EventPost } from "@/lib/adminStore";

export default function JuneEventProducts() {
  const [posts, setPosts] = useState<EventPost[]>([]);

  useEffect(() => {
    adminStore.eventPosts.get().then((data) => {
      if (data.length > 0) setPosts(data);
    });
  }, []);

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
          <Link
            href="/benefit"
            className="self-start sm:self-auto shrink-0 rounded-full border border-[#e0e0e0] px-5 py-2 text-[13px] font-medium text-[#444] transition-colors hover:border-[#c90f45] hover:text-[#c90f45]"
          >
            전체 혜택 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const img = imageUrl(post.image_key);
            const Wrapper = post.link
              ? ({ children }: { children: React.ReactNode }) =>
                  post.link.startsWith("http") ? (
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group block">
                      {children}
                    </a>
                  ) : (
                    <Link href={post.link} className="group block">
                      {children}
                    </Link>
                  )
              : ({ children }: { children: React.ReactNode }) => <div className="group block">{children}</div>;

            return (
              <Wrapper key={post.id}>
                <div className="overflow-hidden rounded-2xl bg-[#f7f7f7]">
                  {img ? (
                    <div className="relative aspect-2/1 overflow-hidden">
                      <Image
                        src={img}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-2/1 items-center justify-center bg-[#f0f0f0]">
                      <span className="text-[13px] text-[#bbb]">이미지 준비중</span>
                    </div>
                  )}
                  <div className="px-5 py-4">
                    <p className="text-[15px] font-bold tracking-tighter text-[#1a1a1a] transition-colors group-hover:text-[#c90f45]">
                      {post.title}
                    </p>
                    {post.subtitle && (
                      <p className="mt-1 text-[13px] text-[#777]">{post.subtitle}</p>
                    )}
                    {post.created_at && (
                      <p className="mt-2 text-[11px] text-[#bbb]">{post.created_at}</p>
                    )}
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
