"use client";


import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { adminStore, type Post } from "@/lib/adminStore";

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const [head, , ...body] = tableRows;
    elements.push(
      <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-[#e8e8e8]">
        <table className="w-full text-[14px]">
          <thead className="bg-[#f8f8f8]">
            <tr>{head.filter(Boolean).map((cell, i) => <th key={i} className="px-5 py-3 text-left font-bold text-[#333]">{cell.trim()}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            {body.map((row, i) => <tr key={i}>{row.filter(Boolean).map((cell, j) => <td key={j} className="px-5 py-3 text-[#555]">{cell.trim()}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("|")) { inTable = true; tableRows.push(line.split("|").slice(1, -1)); continue; }
    if (inTable) flushTable();
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="mt-10 mb-4 text-[24px] font-black tracking-[-0.04em] text-[#1a1a1a]">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} className="mt-7 mb-3 text-[18px] font-bold tracking-[-0.03em] text-[#1a1a1a]">{line.slice(4)}</h3>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} className="mt-4 mb-1 font-bold text-[#1a1a1a]">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(<li key={key++} className="ml-5 list-disc py-0.5 text-[15px] leading-[1.8] text-[#444]" dangerouslySetInnerHTML={{ __html: text }} />);
    } else if (line.startsWith("> ")) {
      elements.push(<blockquote key={key++} className="my-4 border-l-4 border-[#c90f45] bg-[#fff5f7] px-5 py-3 text-[14px] text-[#666]">{line.slice(2)}</blockquote>);
    } else if (/^\d+\./.test(line)) {
      elements.push(<li key={key++} className="ml-5 list-decimal py-0.5 text-[15px] leading-[1.8] text-[#444]">{line.replace(/^\d+\.\s/, "")}</li>);
    } else if (line === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<p key={key++} className="text-[15px] leading-[1.8] text-[#444]">{line}</p>);
    }
  }
  if (inTable) flushTable();
  return elements;
}

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
          <div className="prose-custom">{renderContent(post.content)}</div>
          <div className="mt-14 rounded-2xl bg-[#fff5f7] px-8 py-8 text-center">
            <p className="mb-2 text-[14px] font-medium text-[#c90f45]">궁금한 점이 있으신가요?</p>
            <p className="mb-5 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">전담 매니저가 빠르게 안내해 드립니다</p>
            <a href="/consult" className="inline-flex h-12 items-center justify-center rounded-full bg-[#c90f45] px-10 text-[15px] font-bold text-white transition-opacity hover:opacity-90">
              상담 신청하기
            </a>
          </div>
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
