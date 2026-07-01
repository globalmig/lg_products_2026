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
      <section className="relative isolate min-h-[430px] overflow-hidden bg-[#161616] px-5 py-24 sm:min-h-[520px] sm:py-32">
        <Image src="/images/main/bg_benefit.png" alt="" fill sizes="100vw" priority className="object-cover object-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="relative z-10 mx-auto flex min-h-[250px] max-w-[1180px] flex-col justify-end">
          <p className="mb-4 text-[14px] font-bold tracking-[0.16em] text-white/75">BENEFIT & NEWS</p>
          <h1 className="max-w-[720px] text-[38px] font-black leading-[1.18] tracking-[-0.04em] text-white sm:text-[56px]">혜택 & 이달의 소식</h1>
          <p className="mt-5 max-w-[620px] break-keep text-[16px] leading-[1.8] text-white/82 sm:text-[18px]">LG전자 베스트샵 용산점에서 진행 중인 프로모션, 이벤트, 매장 소식을 한눈에 확인하세요.</p>
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
            <ul className="divide-y divide-[#ececec]">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/benefit/${post.id}`} className="group block py-7">
                    <article className="grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-8">
                      <div className="flex items-center gap-3 sm:block">
                        <time className="text-[13px] font-semibold text-[#999] sm:mt-3 sm:block">
                          {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                      </div>
                      <div>
                        <h3 className="break-keep text-[22px] font-black leading-[1.45] tracking-[-0.04em] text-[#1a1a1a] group-hover:text-[#c90f45] transition-colors">{post.title}</h3>
                        <p className="mt-3 break-keep text-[15px] leading-[1.8] text-[#666] line-clamp-2">
                          {post.content
                            .replace(/[#*>\-|]/g, "")
                            .trim()
                            .slice(0, 120)}
                        </p>
                        <span className="mt-4 inline-block text-[13px] font-semibold text-[#c90f45] opacity-0 group-hover:opacity-100 transition-opacity">자세히 보기 →</span>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
