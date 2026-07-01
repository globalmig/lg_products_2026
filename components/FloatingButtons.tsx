"use client";

import { useEffect, useState } from "react";
import { LuArrowUp } from "react-icons/lu";
import { adminStore, imageUrl, type ChannelIcon } from "@/lib/adminStore";

const DEFAULT_ICONS: ChannelIcon[] = [
  { id: "1", label: "상담 신청", imageKey: "/images/main/btn/reservation-1.png", href: "/consult", primary: true },
  { id: "2", label: "카카오톡 상담", imageKey: "/images/main/btn/kakaotalk.png", href: "https://pf.kakao.com/_xnMRRX", primary: false },
  { id: "3", label: "인스타그램", imageKey: "/images/main/btn/insta.png", href: "https://www.instagram.com/lgebestshop_yongsan", primary: false },
  { id: "4", label: "블로그", imageKey: "/images/main/btn/blog.png", href: "https://blog.naver.com/lg_yongsan", primary: false },
];

export default function FloatingButtons() {
  const [icons, setIcons] = useState<ChannelIcon[]>(DEFAULT_ICONS);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      if (s.channelIcons?.length) setIcons(s.channelIcons);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-3 md:right-[2.5%] bottom-5 md:bottom-[10%] z-50 flex flex-col items-center gap-2 md:gap-3">
      {showTop && (
        <button
          type="button"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-white text-[#555] shadow-md drop-shadow-sm hover:text-[#c90f45]"
        >
          <LuArrowUp size={20} />
        </button>
      )}
      {icons.map((btn) => (
        <a
          href={btn.href}
          key={btn.id}
          aria-label={btn.label}
          target={btn.href.startsWith("http") ? "_blank" : undefined}
          rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(btn.imageKey)}
            alt={btn.label}
            className={`drop-shadow-sm object-contain ${btn.primary ? "w-12 h-12 md:w-16 md:h-16" : "w-10 h-10 md:w-14 md:h-14"}`}
          />
        </a>
      ))}
    </div>
  );
}
