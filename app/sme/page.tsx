"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminStore, type Post } from "@/lib/adminStore";

export default function SmePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStore.posts.get("smallbiz").then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="bg-white text-[#171717]">
      <section className="relative isolate min-h-[430px] overflow-hidden bg-[#171717] px-5 py-24 sm:min-h-[520px] sm:py-32">
        <Image src="/images/main/bg_hero_1.png" alt="" fill sizes="100vw" priority className="object-cover object-center opacity-58" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/42 to-black/12" />
        <div className="relative z-10 mx-auto flex min-h-[250px] max-w-[1180px] flex-col justify-end">
          <p className="mb-4 text-[14px] font-bold tracking-[0.16em] text-white/75">SMALL BUSINESS</p>
          <h1 className="max-w-[760px] text-[38px] font-black leading-[1.18] tracking-[-0.04em] text-white sm:text-[56px]">
            소상공인 전용 안내
          </h1>
          <p className="mt-5 max-w-[640px] break-keep text-[16px] leading-[1.8] text-white/82 sm:text-[18px]">
            사업장 규모와 업종에 맞는 가전 구성, 구독, 설치 상담을 LG전자 베스트샵 용산점에서 도와드립니다.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex flex-col gap-3 border-b border-[#1a1a1a] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-bold text-[#c90f45]">LIST</p>
              <h2 className="text-[30px] font-black tracking-[-0.04em] sm:text-[36px]">사업자 상담 항목</h2>
            </div>
            <p className="text-[14px] text-[#777]">게시물 상세 화면 없이 리스트만 제공합니다.</p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[14px] text-[#bbb]">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-[14px] text-[#bbb]">등록된 소식이 없습니다.</div>
          ) : (
            <ul className="divide-y divide-[#ececec]">
              {posts.map((post) => (
                <li key={post.id} className="py-7">
                  <article className="grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-8">
                    <div className="flex items-center gap-3 sm:block">
                      <time className="text-[13px] font-semibold text-[#999] sm:mt-3 sm:block">
                        {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                      </time>
                    </div>
                    <div>
                      <h3 className="break-keep text-[22px] font-black leading-[1.45] tracking-[-0.04em] text-[#1a1a1a]">{post.title}</h3>
                      <p className="mt-3 break-keep text-[15px] leading-[1.8] text-[#666] line-clamp-2">
                        {post.content.replace(/[#*>\-|]/g, "").trim().slice(0, 120)}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
