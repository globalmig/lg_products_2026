"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { search, type SearchResult } from "@/data/searchIndex";
import { adminStore } from "@/lib/adminStore";
import { productStore, type ManagedCategory } from "@/lib/productStore";

type SubItem = { label: string; href: string };
type NavItem = { label: string; href: string; sub?: SubItem[] };

const SECTION_NAV: { section: string; label: string; href: string }[] = [
  { section: "kitchen", label: "주방가전", href: "/products/kitchen" },
  { section: "tv",      label: "TV",      href: "/products/tv" },
  { section: "living",  label: "생활가전", href: "/products/living" },
  { section: "air",     label: "에어케어", href: "/products/air" },
];

function buildNavItems(categories: ManagedCategory[]): NavItem[] {
  const productNavItems: NavItem[] = SECTION_NAV.map(({ section, label, href }) => {
    const cats = categories
      .filter((c) => c.section === section)
      .sort((a, b) => a.order - b.order);
    return {
      label,
      href,
      sub: cats.length > 0 ? cats.map((c) => ({ label: c.name, href: `${href}?category=${encodeURIComponent(c.name)}` })) : undefined,
    };
  });
  return [
    { label: "6월 행사", href: "/benefit" },
    ...productNavItems,
    { label: "제휴카드", href: "/subscription?tab=card" },
    { label: "리뷰 이벤트", href: "/news" },
  ];
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [drawerExpanded, setDrawerExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 검색
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [storeName, setStoreName] = useState("");
  const [navItems, setNavItems] = useState<NavItem[]>(buildNavItems([]));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => setStoreName(s.storeName));
    productStore.categories.get().then((cats) => setNavItems(buildNavItems(cats)));
  }, []);

  useEffect(() => {
    setResults(search(query));
  }, [query]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  if (pathname.startsWith("/lgbs-7x4q2")) return null;

  const handleNavEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveNav(label);
  };

  const handleNavLeave = () => {
    closeTimer.current = setTimeout(() => setActiveNav(null), 120);
  };

  const handleDropdownEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-5">
          <Link href="/" aria-label="LG전자 BEST SHOP 홈" className="flex items-center gap-2">
            <Image src="/images/logo2.png" alt="LG전자 BEST SHOP" width={24} height={24} priority />
            {storeName && <span className="hidden text-[16px] font-black text-[#777] sm:inline">{storeName}</span>}
          </Link>

          {/* 데스크톱 GNB */}
          <nav className="hidden h-full items-center gap-1 md:flex" aria-label="주요 메뉴">
            {navItems.map(({ label, href, sub }) => {
              const isActive = pathname.startsWith("/subscription") && href.startsWith("/subscription?tab=") ? false : href !== "/" && pathname.startsWith(href.split("?")[0]);
              const isOpen = activeNav === label;

              return (
                <div key={label} className="relative flex h-full items-center" onMouseEnter={() => handleNavEnter(label)} onMouseLeave={handleNavLeave}>
                  <Link
                    href={href}
                    className={`flex h-7 items-center rounded px-3 text-[13px] font-semibold transition-colors ${isActive || isOpen ? "text-[#c90f45]" : "text-[#333] hover:text-[#c90f45]"}`}
                  >
                    {label}
                    {sub && (
                      <svg className={`ml-0.5 h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* 드롭다운 */}
                  {sub && isOpen && (
                    <div
                      className="absolute left-0 top-full z-40 min-w-40 rounded-b border border-t-0 border-[#e8e8e8] bg-white shadow-md"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleNavLeave}
                    >
                      {sub.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setActiveNav(null)}
                          className="block px-4 py-2.5 text-[13px] text-[#444] transition-colors hover:bg-[#fff0f4] hover:text-[#c90f45]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* 검색 버튼 */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#555] hover:bg-[#f5f5f5] hover:text-[#c90f45] transition-colors"
              aria-label="검색"
            >
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            <a href="/consult" className="hidden h-7 min-w-20 items-center justify-center rounded-full bg-[#c90f45] px-4 text-[13px] font-bold text-white md:flex">
              상담 신청
            </a>
          </div>

          {/* 모바일 햄버거 */}
          <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden" aria-label="메뉴 열기">
            <span className="h-[2px] w-5 bg-[#333]" />
            <span className="h-[2px] w-5 bg-[#333]" />
            <span className="h-[2px] w-5 bg-[#333]" />
          </button>
        </div>
      </header>

      {/* 검색 오버레이 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 bg-white px-5 py-5 shadow-lg">
            <div className="mx-auto max-w-[720px]">
              <div className="flex items-center gap-3 rounded-full border-2 border-[#c90f45] bg-white px-5 py-2.5">
                <svg className="h-4.5 w-4.5 shrink-0 text-[#c90f45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && results[0]) goTo(results[0].href);
                  }}
                  placeholder="상품명, 카테고리, 혜택을 검색하세요"
                  className="flex-1 bg-transparent text-[15px] text-[#1a1a1a] outline-none placeholder:text-[#bbb]"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[20px] text-[#999] hover:text-[#333]">
                  ✕
                </button>
              </div>

              {/* 결과 */}
              {query && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-md">
                  {results.length > 0 ? (
                    <ul>
                      {results.map((item, i) => (
                        <li key={i}>
                          <button type="button" onClick={() => goTo(item.href)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#fff5f7]">
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${item.type === "product" ? "bg-[#f0f0f0] text-[#666]" : "bg-[#f8eef2] text-[#c90f45]"}`}>
                              {item.type === "product" ? "상품" : "소식"}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-semibold text-[#1a1a1a]">{item.title}</span>
                              <span className="block truncate text-[12px] text-[#999]">{item.subtitle}</span>
                            </span>
                            <svg className="h-4 w-4 shrink-0 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-6 text-center text-[14px] text-[#999]">'{query}'에 대한 검색 결과가 없습니다.</p>
                  )}
                </div>
              )}

              {!query && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {["냉장고", "에어컨", "워시타워", "스타일러", "OLED", "6월 혜택"].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setQuery(kw)}
                      className="rounded-full border border-[#e8e8e8] px-3 py-1 text-[13px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 모바일 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-5 py-4">
              <span className="text-[15px] font-bold text-[#333]">메뉴</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="flex h-8 w-8 items-center justify-center text-[22px] text-[#666]" aria-label="메뉴 닫기">
                ✕
              </button>
            </div>

            <nav className="flex flex-col">
              {navItems.map(({ label, href, sub }) => {
                const isExpanded = drawerExpanded === label;
                return (
                  <div key={label} className="border-b border-[#f1f1f1]">
                    <div className="flex items-center justify-between px-5">
                      <Link href={href} onClick={() => !sub && setDrawerOpen(false)} className="flex-1 py-4 text-[15px] font-semibold text-[#333]">
                        {label}
                      </Link>
                      {sub && (
                        <button
                          type="button"
                          onClick={() => setDrawerExpanded(isExpanded ? null : label)}
                          className="flex h-8 w-8 items-center justify-center text-[#999]"
                          aria-label={isExpanded ? "접기" : "펼치기"}
                        >
                          <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {sub && isExpanded && (
                      <div className="bg-[#fafafa] pb-2">
                        {sub.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setDrawerOpen(false)} className="block px-8 py-2.5 text-[13px] text-[#555] hover:text-[#c90f45]">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="px-5 pt-4 pb-6">
              <a href="/consult" onClick={() => setDrawerOpen(false)} className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white">
                상담 신청
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
