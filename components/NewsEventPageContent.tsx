"use client";

import { useEffect, useState } from "react";
import {
  LuShoppingCart,
  LuStar,
  LuCamera,
  LuGift,
  LuCalendarDays,
  LuUsers,
  LuArrowRight,
} from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { adminStore, type NewsEventContent } from "@/lib/adminStore";

const STEP_ICONS = [LuShoppingCart, LuStar, LuCamera, LuGift];

const DEFAULT_CONTENT: NewsEventContent = {
  badge: "2026년 6월 리뷰 이벤트",
  titleLine1: "후기 남기고",
  titleLine2: "경품 받아가세요",
  description: "LG전자 베스트샵 용산점에서 구독·구매 후 네이버 지도 리뷰를 작성하시면 추첨을 통해 경품을 드립니다.",
  period: "2026.06.01 – 06.30",
  target: "구독·구매 완료 고객",
  steps: [
    { title: "구독 or 구매 상담", desc: "매장 방문 또는 온라인으로 상담 후 제품을 구독·구매하세요." },
    { title: "네이버 지도 리뷰 작성", desc: "LG전자 베스트샵 용산점 네이버 지도 페이지에 별점 5점 + 50자 이상 후기를 남겨주세요." },
    { title: "리뷰 캡처 제출", desc: "작성한 리뷰 화면을 캡처하여 카카오톡 채널 또는 상담 신청 폼으로 전송해주세요." },
    { title: "경품 수령", desc: "확인 후 영업일 3일 이내 문자로 경품 발송 안내드립니다." },
  ],
  prizes: [
    { rank: "1등", count: "매월 2명", name: "스타벅스 아메리카노\n10잔 쿠폰", value: "60,000원 상당", highlight: true },
    { rank: "2등", count: "매월 5명", name: "편의점 상품권", value: "20,000원", highlight: false },
    { rank: "참여 전원", count: "선착순 30명", name: "스타벅스 아메리카노\n1잔 쿠폰", value: "6,000원 상당", highlight: false },
  ],
  prizeNote: "※ 당첨자 발표는 매월 초 개별 문자 발송 / 경품은 변경될 수 있습니다.",
  reviews: [],
};

export default function NewsEventPageContent() {
  const [content, setContent] = useState<NewsEventContent>(DEFAULT_CONTENT);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      if (s.newsEvent) setContent(s.newsEvent);
    });
  }, []);

  const { badge, titleLine1, titleLine2, description, period, target, steps, prizes, prizeNote, reviews } = content;

  return (
    <main className="bg-white text-[#1a1a1a]">

      {/* 히어로 */}
      <section className="relative overflow-hidden bg-[#0d0d0d] px-5 py-14 sm:py-20 lg:py-28">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #c90f45 0%, transparent 60%), radial-gradient(circle at 20% 80%, #ff6b35 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px]">
          <span className="mb-4 inline-flex items-center gap-2 break-keep rounded-full border border-[#c90f45]/50 bg-[#c90f45]/10 px-4 py-1.5 text-[13px] font-bold text-[#ff6b8a]">
            <LuGift size={14} />
            {badge}
          </span>
          <h1 className="mt-4 break-keep text-[28px] font-black leading-[1.18] tracking-[-0.04em] text-white sm:text-[42px] lg:text-[56px]">
            {titleLine1}<br />
            <span className="text-[#ff6b8a]">{titleLine2}</span>
          </h1>
          <p className="mt-5 max-w-[560px] break-keep text-[15px] leading-[1.8] text-white/70 sm:text-[16px]">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 break-keep text-[13px] font-semibold text-white/50">
            <span className="flex items-center gap-1.5">
              <LuCalendarDays size={14} />
              이벤트 기간 : {period}
            </span>
            <span className="flex items-center gap-1.5">
              <LuUsers size={14} />
              대상 : {target}
            </span>
          </div>
        </div>
      </section>

      {/* 참여 방법 */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">HOW TO</p>
          <h2 className="mb-12 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">이렇게 참여하세요</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? LuGift;
              return (
                <div key={i} className="relative rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f3]">
                    <Icon size={22} className="text-[#c90f45]" />
                  </div>
                  <span className="mb-2 block text-[12px] font-black tracking-[0.1em] text-[#c90f45]">STEP {String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mb-2 break-keep text-[16px] font-black tracking-[-0.03em]">{s.title}</h3>
                  <p className="break-keep text-[13px] leading-[1.7] text-[#666]">{s.desc}</p>
                  {i !== steps.length - 1 && (
                    <LuArrowRight
                      size={20}
                      className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[#ddd] lg:block"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 경품 안내 */}
      <section className="bg-[#fafafa] px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">PRIZE</p>
          <h2 className="mb-10 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">경품 안내</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {prizes.map((prize, i) => (
              <div
                key={i}
                className={`rounded-2xl p-7 ${
                  prize.highlight
                    ? "bg-gradient-to-br from-[#c90f45] to-[#8b0030] text-white shadow-lg"
                    : "border border-[#ebebeb] bg-white"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-black ${
                      prize.highlight ? "bg-white/20 text-white" : "bg-[#fff0f3] text-[#c90f45]"
                    }`}
                  >
                    {prize.rank}
                  </span>
                  <span className={`text-[12px] font-semibold ${prize.highlight ? "text-white/70" : "text-[#999]"}`}>
                    {prize.count}
                  </span>
                </div>
                <p
                  className={`whitespace-pre-line break-keep text-[20px] font-black leading-[1.4] tracking-[-0.03em] ${
                    prize.highlight ? "text-white" : "text-[#1a1a1a]"
                  }`}
                >
                  {prize.name}
                </p>
                <p className={`mt-2 text-[13px] font-semibold ${prize.highlight ? "text-white/80" : "text-[#888]"}`}>
                  {prize.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 break-keep text-[12px] text-[#aaa]">
            {prizeNote}
          </p>
        </div>
      </section>

      {/* 생생 후기 */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <p className="mb-2 text-[13px] font-bold text-[#c90f45]">REVIEW</p>
          <h2 className="mb-10 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">고객 생생 후기</h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[#f0f0f0] bg-white p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <FaStar key={i} size={14} className="text-[#f5a623]" />
                  ))}
                </div>
                <p className="mb-4 break-keep text-[14px] leading-[1.75] text-[#444]">
                  &ldquo;{r.content}&rdquo;
                </p>
                <div className="border-t border-[#f5f5f5] pt-4">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">{r.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#999]">{r.product}</p>
                  <p className="mt-0.5 text-[11px] text-[#bbb]">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
