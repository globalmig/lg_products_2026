"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminStore, type EventBanner as EventBannerData } from "@/lib/adminStore";

export default function EventBanner() {
  const [banner, setBanner] = useState<EventBannerData | null>(null);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => setBanner(s.eventBanner));
  }, []);

  return (
    <section className="bg-gradient-to-r from-[#c90f45] to-[#9b0a33] py-8 sm:py-10">
      <div className="mx-auto flex max-w-300 flex-col items-center gap-5 px-5 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div>
          <p className="mb-1 text-[12px] sm:text-[13px] font-semibold text-[#ffb3c8]">{banner?.badge ?? "이달의 행사"}</p>
          <h2 className="break-keep text-[20px] font-black tracking-[-0.04em] text-white sm:text-[26px]">
            {banner?.title ?? "이달의 행사 진행 중 🎉"}
          </h2>
          <p className="mt-1 break-keep text-[12px] text-[#ffd6e2] sm:text-[13px]">
            {banner?.description || "이달의 특별 할인 혜택을 놓치지 마세요"}
          </p>
        </div>

        <Link
          href={banner?.buttonHref || "/benefit"}
          className="shrink-0 rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-[#c90f45] transition-opacity hover:opacity-90"
        >
          {banner?.buttonLabel || "혜택 확인하기 →"}
        </Link>
      </div>
    </section>
  );
}
