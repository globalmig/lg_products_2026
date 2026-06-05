"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { adminStore, type Manager } from "@/lib/adminStore";

export default function ManagerSection() {
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    setManagers(adminStore.managers.get());
  }, []);

  if (managers.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[13px] font-medium tracking-[0.08em] text-[#c90f45]">용산전자상가점 매니저를 소개합니다</p>
          <h2 className="mb-3 text-[34px] font-black tracking-[-0.05em] text-[#1a1a1a]">상담 매니저</h2>
          <p className="text-[14px] text-[#888]">고객 리뷰를 바탕으로 선정된 MVP 매니저를 소개합니다.</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          {managers.map((m) => (
            <a
              key={m.id}
              href={m.href}
              target={m.href.startsWith("http") ? "_blank" : undefined}
              rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex w-full max-w-90 flex-col items-center rounded-2xl bg-[#fdf3f5] px-10 py-10 transition-shadow hover:shadow-md"
            >
              <div className="mb-5 h-[140px] w-[140px] overflow-hidden rounded-full bg-[#f0dde2]">
                <Image src={m.img} alt={m.name} width={140} height={140} className="h-full w-full object-cover object-top" />
              </div>
              <p className="mb-1 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">{m.name}</p>
              <p className="mb-5 text-[13px] text-[#aaa]">{m.store}</p>
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {m.tags.map((tag, i) => (
                  <span key={tag} className={`rounded-full px-3 py-1 text-[12px] font-medium ${i === 0 ? "border border-[#c90f45] text-[#c90f45]" : "bg-white text-[#555]"}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mb-6 text-[13px] text-[#666]">{m.desc}</p>
              <span className="flex h-10 w-full items-center justify-center rounded-full bg-[#c90f45] text-[13px] font-bold text-white transition-opacity group-hover:opacity-90">예약 상담 신청</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
