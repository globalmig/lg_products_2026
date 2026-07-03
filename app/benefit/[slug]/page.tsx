"use client";


import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { adminStore, type Post } from "@/lib/adminStore";
import { renderPostContent } from "@/lib/renderPostContent";

export default function BenefitDetailPage() {
  const { slug: id } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    adminStore.posts.get("benefit").then((posts) => {
      setAllPosts(posts);
      const found = posts.find((p) => p.id === id);
      if (found) {
        setPost(found);
      } else {
        setMissing(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <main className="bg-white py-32 text-center text-[14px] text-[#bbb]">불러오는 중...</main>;
  if (missing || !post) return notFound();

  const currentIndex = allPosts.findIndex((p) => p.id === id);
  const prev = allPosts[currentIndex + 1];
  const next = allPosts[currentIndex - 1];

  return (
    <main className="bg-white text-[#171717]">
      <section className="border-b border-[#ececec] px-5 py-12">
        <div className="mx-auto max-w-270">
          <Link href="/benefit" className="mb-6 inline-flex items-center gap-1 text-[13px] font-semibold text-[#999] hover:text-[#c90f45] transition-colors">
            ← 목록으로
          </Link>
          <div className="mt-4">
            <time className="text-[13px] text-[#999]">
              {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <h1 className="mt-4 break-keep text-[28px] font-black leading-[1.35] tracking-[-0.04em] text-[#1a1a1a] sm:text-[36px]">
            {post.title}
          </h1>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto max-w-270">
          <div className="prose-custom">{renderPostContent(post.content)}</div>
        </div>
      </section>

      <section className="border-t border-[#ececec] px-5 py-8">
        <div className="mx-auto max-w-270 flex justify-between gap-4">
          {next ? (
            <Link href={`/benefit/${next.id}`} className="group flex flex-col gap-1">
              <span className="text-[12px] text-[#999]">← 다음 글</span>
              <span className="text-[14px] font-semibold text-[#333] group-hover:text-[#c90f45] transition-colors line-clamp-1">{next.title}</span>
            </Link>
          ) : <div />}
          {prev ? (
            <Link href={`/benefit/${prev.id}`} className="group flex flex-col items-end gap-1">
              <span className="text-[12px] text-[#999]">이전 글 →</span>
              <span className="text-[14px] font-semibold text-[#333] group-hover:text-[#c90f45] transition-colors line-clamp-1">{prev.title}</span>
            </Link>
          ) : <div />}
        </div>
      </section>
    </main>
  );
}
