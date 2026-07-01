"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const tabs = [
  { label: "구독 서비스 안내", value: "service" },
  { label: "혜택 안내", value: "benefit" },
  { label: "제휴카드 안내", value: "card" },
];

export default function SubscriptionTabs() {
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") ?? "service";

  return (
    <nav className="border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto flex max-w-[1080px] px-5">
        {tabs.map((tab) => {
          const isActive = current === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/subscription?tab=${tab.value}`}
              className={`relative flex flex-1 items-center justify-center py-4 text-[14px] font-semibold transition-colors ${
                isActive ? "text-[#c90f45]" : "text-[#999] hover:text-[#555]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#c90f45]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
