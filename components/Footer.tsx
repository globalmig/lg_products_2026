"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { adminStore } from "@/lib/adminStore";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "@/lib/siteDefaults";

type ModalType = "privacy" | "terms" | null;

export default function Footer() {
  const pathname = usePathname();
  const [modal, setModal] = useState<ModalType>(null);
  const [storeName, setStoreName] = useState("용산전자상가점");
  const [copyright, setCopyright] = useState("© 2025 LG Electronics Inc. All rights reserved.");
  const [privacyContent, setPrivacyContent] = useState(DEFAULT_PRIVACY);
  const [termsContent, setTermsContent] = useState(DEFAULT_TERMS);
  const [footerInfo, setFooterInfo] = useState<{ id: string; label: string; value: string }[]>([]);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      setStoreName(s.storeName);
      setCopyright(s.copyright);
      if (s.privacyContent) setPrivacyContent(s.privacyContent);
      if (s.termsContent) setTermsContent(s.termsContent);
      if (s.footerInfo?.length) setFooterInfo(s.footerInfo);
    });
  }, []);

  if (pathname.startsWith("/lgbs-7x4q2")) return null;

  const modalData = modal === "privacy"
    ? { title: "개인정보처리방침", content: privacyContent }
    : modal === "terms"
    ? { title: "이용약관", content: termsContent }
    : null;

  return (
    <>
      <footer className="border-t border-[#efefef] bg-white py-8">
        <div className="mx-auto max-w-270 px-5 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Image src="/images/logo2.png" alt="LG전자 BEST SHOP" width={36} height={36} />
            {storeName && (
              <span className="text-[16px] font-black text-[#777]">{storeName}</span>
            )}
          </div>

          <nav className="mb-4 flex items-center justify-center gap-4">
            {(["privacy", "terms"] as const).map((type, i) => (
              <span key={type} className="flex items-center gap-4">
                <button
                  onClick={() => setModal(type)}
                  className="text-[12px] text-[#666] hover:underline"
                >
                  {type === "privacy" ? "개인정보 처리방침" : "이용약관"}
                </button>
                {i === 0 && <span className="h-3 w-px bg-[#ddd]" />}
              </span>
            ))}
          </nav>

          {footerInfo.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {footerInfo.map((item) => (
                <span key={item.id} className="text-[11px] text-[#aaa]">
                  <span className="mr-1 text-[#ccc]">{item.label}</span>
                  {item.value}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] text-[#aaa]">{copyright}</p>
        </div>
      </footer>

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-150 flex-col rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-6 py-4">
              <h2 className="text-[16px] font-black tracking-tighter text-[#1a1a1a]">{modalData.title}</h2>
              <button
                onClick={() => setModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#888] hover:bg-[#f5f5f5]"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[#555]">
                {modalData.content}
              </pre>
            </div>
            <div className="border-t border-[#f1f1f1] px-6 py-4">
              <button
                onClick={() => setModal(null)}
                className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
