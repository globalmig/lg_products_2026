"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeroAdmin from "@/components/admin/HeroAdmin";
import ConsultAdmin from "@/components/admin/ConsultAdmin";
import ProductAdmin from "@/components/admin/ProductAdmin";
import FeatureBannerAdmin from "@/components/admin/FeatureBannerAdmin";
import MainCategoryAdmin from "@/components/admin/MainCategoryAdmin";
import EventPostAdmin from "@/components/admin/EventPostAdmin";
import PostAdmin from "@/components/admin/PostAdmin";
import CardDiscountAdmin from "@/components/admin/CardDiscountAdmin";
import ReviewAdmin from "@/components/admin/ReviewAdmin";
import { adminStore } from "@/lib/adminStore";

const NAV = [
  { id: "dashboard", label: "대시보드", icon: "⊞" },
  { id: "products", label: "상품 관리", icon: "📦" },
  { id: "hero", label: "히어로 슬라이드", icon: "🖼" },
  { id: "featureBanner", label: "피처 배너", icon: "🏷" },
  { id: "mainCategory", label: "메인 카테고리", icon: "🗂" },
  { id: "benefitPosts", label: "혜택 & 소식 관리", icon: "📝" },
  { id: "cardDiscounts", label: "제휴카드 관리", icon: "💳" },
  { id: "reviews", label: "리뷰 관리", icon: "⭐" },
  { id: "consult", label: "상담 신청 현황", icon: "📋" },
] as const;

type TabId = (typeof NAV)[number]["id"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 대시보드 통계
  const [stats, setStats] = useState({ consult: 0, newConsult: 0, slides: 0 });
  const [monthly, setMonthly] = useState<{ key: string; label: string; count: number }[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAuthed(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    const [consult, slides] = await Promise.all([
      adminStore.consult.get(),
      adminStore.slides.get(),
    ]);
    setStats({
      consult: consult.length,
      newConsult: consult.filter((c) => c.status === "new").length,
      slides: slides.length,
    });
    const now = new Date();
    const m = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `${d.getMonth() + 1}월`, count: 0 };
    });
    consult.forEach((c) => {
      const key = c.submitted_at.slice(0, 7);
      const found = m.find((x) => x.key === key);
      if (found) found.count++;
    });
    setMonthly(m);
  };

  const login = async () => {
    const res = await fetch("/lgbs-7x4q2/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_auth", "true");
      setAuthed(true);
      loadStats();
    } else {
      setError(true);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
    setPw("");
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-5">
        <div className="w-full max-w-sm rounded-2xl border border-[#f1f1f1] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#c90f45] text-[16px] font-black text-white">LG</span>
            <p className="mt-2 text-[12px] font-semibold tracking-widest text-[#c90f45]">ADMIN</p>
            <h1 className="text-[22px] font-black tracking-tighter text-[#1a1a1a]">관리자 로그인</h1>
          </div>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="mb-2 h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none focus:border-[#c90f45]"
          />
          {error && <p className="mb-3 text-[12px] text-[#c90f45]">비밀번호가 올바르지 않습니다.</p>}
          <button onClick={login} className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white hover:opacity-90">
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1a1a2e] transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-15" : "lg:w-60"} w-60`}>
        {/* 로고 */}
        <div className={`flex items-center border-b border-white/10 px-4 py-4 ${collapsed ? "justify-end" : "justify-between"}`}>
          {!collapsed && (
            <Image src="/images/logo_white.png" alt="LG전자 BEST SHOP" width={120} height={30} />
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* 내비게이션 */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); if (item.id === "dashboard") loadStats(); }}
              title={collapsed ? item.label : undefined}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                tab === item.id
                  ? "bg-[#c90f45] text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="shrink-0 text-[16px]">{item.icon}</span>
              {!collapsed && (
                <>
                  {item.label}
                  {item.id === "consult" && stats.newConsult > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold text-white">
                      {stats.newConsult}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.id === "consult" && stats.newConsult > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#c90f45]" />
              )}
            </button>
          ))}
        </nav>

        {/* 하단 */}
        <div className="border-t border-white/10 px-2 py-4 space-y-1">
          <a href="/" target="_blank" title={collapsed ? "사이트 보기" : undefined} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-white/50 hover:text-white/80 ${collapsed ? "justify-center" : ""}`}>
            <span>↗</span>{!collapsed && " 사이트 보기"}
          </a>
          <button onClick={logout} title={collapsed ? "로그아웃" : undefined} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-white/50 hover:text-white/80 ${collapsed ? "justify-center" : ""}`}>
            <span>→</span>{!collapsed && " 로그아웃"}
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "lg:pl-15" : "lg:pl-60"}`}>

        {/* 상단 바 */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e8e8e8] bg-white px-5">
          <button onClick={() => setSidebarOpen(true)} className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] lg:hidden">
            <span className="h-[2px] w-5 bg-[#333]" />
            <span className="h-[2px] w-5 bg-[#333]" />
            <span className="h-[2px] w-5 bg-[#333]" />
          </button>
          <p className="text-[15px] font-bold text-[#1a1a1a]">
            {NAV.find((n) => n.id === tab)?.label}
          </p>
          <span className="text-[12px] text-[#aaa]">관리자</span>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 p-5 lg:p-8">

          {/* 대시보드 */}
          {tab === "dashboard" && (
            <div>
              <p className="mb-6 text-[13px] text-[#888]">안녕하세요, 관리자님. LG베스트샵 용산점 현황입니다.</p>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "전체 상담 신청", value: stats.consult, unit: "건", color: "bg-blue-50 text-blue-600", onClick: () => setTab("consult") },
                  { label: "신규 미확인", value: stats.newConsult, unit: "건", color: "bg-red-50 text-[#c90f45]", onClick: () => setTab("consult") },
                  { label: "히어로 슬라이드", value: stats.slides, unit: "개", color: "bg-purple-50 text-purple-600", onClick: () => setTab("hero") },
                ].map((card) => (
                  <button key={card.label} onClick={card.onClick}
                    className="rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md">
                    <p className="mb-3 text-[12px] font-medium text-[#888]">{card.label}</p>
                    <p className={`text-[32px] font-black ${card.color.split(" ")[1]}`}>{card.value}</p>
                    <p className="text-[12px] text-[#bbb]">{card.unit}</p>
                  </button>
                ))}
              </div>

              {(() => {
                const now = new Date();
                const maxVal = Math.max(...monthly.map((m) => m.count), 1);

                return (
                  <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <p className="font-bold text-[#1a1a1a]">월별 문의 건수</p>
                      <span className="text-[12px] text-[#aaa]">최근 12개월</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-44">
                      {monthly.map((m) => (
                        <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-[#555]">{m.count > 0 ? m.count : ""}</span>
                          <div className="w-full rounded-t-md bg-[#f1f1f1] overflow-hidden flex flex-col justify-end" style={{ height: "120px" }}>
                            <div
                              className="w-full rounded-t-md transition-all duration-500"
                              style={{
                                height: `${(m.count / maxVal) * 100}%`,
                                minHeight: m.count > 0 ? "4px" : "0",
                                backgroundColor: m.key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` ? "#c90f45" : "#4f7ff7",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[#aaa]">{m.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-[#aaa]">
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-[#4f7ff7]" />이전 달</span>
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-[#c90f45]" />이번 달</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "products" && <ProductAdmin />}
          {tab === "hero" && <HeroAdmin />}
          {tab === "featureBanner" && <FeatureBannerAdmin />}
          {tab === "mainCategory" && <MainCategoryAdmin />}
          {tab === "eventProducts" && <EventPostAdmin />}
          {tab === "benefitPosts" && <PostAdmin storeKey="benefit" title="혜택 & 소식 관리" />}
          {tab === "cardDiscounts" && <CardDiscountAdmin />}
          {tab === "reviews" && <ReviewAdmin />}
          {tab === "consult" && <ConsultAdmin />}
        </main>
      </div>
    </div>
  );
}
