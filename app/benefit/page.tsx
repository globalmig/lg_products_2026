"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminStore, type Post } from "@/lib/adminStore";

export default function BenefitNewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStore.posts.get("benefit").then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="bg-white text-[#171717]">
      <section className="relative isolate min-h-75 overflow-hidden bg-[#161616] px-5 py-14 sm:min-h-95 sm:py-20 lg:min-h-120 lg:py-28">
        <Image src="/images/main/bg_benefit.png" alt="" fill sizes="100vw" priority className="object-cover object-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="relative z-10 mx-auto flex min-h-40 max-w-[1180px] flex-col justify-end sm:min-h-50 lg:min-h-60">
          <p className="mb-4 text-[14px] font-bold tracking-[0.16em] text-white/75">BENEFIT & NEWS</p>
          <h1 className="max-w-[720px] text-[28px] font-black leading-[1.18] tracking-[-0.04em] text-white sm:text-[42px] lg:text-[56px]">혜택 & 이달의 소식</h1>
          <p className="mt-5 max-w-[620px] break-keep text-[15px] leading-[1.8] text-white/82 sm:text-[17px] lg:text-[18px]">LG전자 베스트샵 용산점에서 진행 중인 프로모션, 이벤트, 매장 소식을 한눈에 확인하세요.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex flex-col gap-3 border-b border-[#1a1a1a] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-bold text-[#c90f45]">LIST</p>
              <h2 className="text-[30px] font-black tracking-[-0.04em] sm:text-[36px]">진행 중인 소식</h2>
            </div>
            {/* <p className="text-[14px] text-[#777]">썸네일 없이 핵심 내용만 정리했습니다.</p> */}
          </div>

          {loading ? (
            <div className="py-20 text-center text-[14px] text-[#bbb]">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-[14px] text-[#bbb]">등록된 소식이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/benefit/${post.id}`}
                  className="group block rounded-2xl border border-[#ececec] p-6 transition-colors hover:border-[#c90f45] sm:p-7"
                >
                  <time className="text-[13px] font-semibold text-[#999]">
                    {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                  <h3 className="mt-2 break-keep text-[20px] font-black leading-[1.45] tracking-[-0.04em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors sm:text-[22px]">
                    {post.title}
                  </h3>
                  <p className="mt-3 break-keep text-[15px] leading-[1.8] text-[#666] line-clamp-2">
                    {post.content
                      .replace(/[#*>\-|]/g, "")
                      .trim()
                      .slice(0, 120)}
                  </p>
                  <span className="mt-4 inline-block text-[13px] font-semibold text-[#c90f45] opacity-0 group-hover:opacity-100 transition-opacity">자세히 보기 →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
