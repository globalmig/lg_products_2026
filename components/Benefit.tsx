"use client";

import Image from "next/image";

const benefits = [
  { icon: "/images/icon/3D/house.png", text: "전문가의\n방문관리" },
  { icon: "/images/icon/3D/calendar.png", text: "구독 기간내\n무상 A/S" },
  { icon: "/images/icon/3D/box.png", text: "LG 정품\n소모품 정기\n무상 교체" },
  { icon: "/images/icon/3D/Wallet.png", text: "전문가의\n방문관리" },
  { icon: "/images/icon/3D/gift.png", text: "일시불과\n차이없는\n가격!" },
  { icon: "/images/icon/3D/truck.png", text: "이사 & 위치 변경\n무상 재설치" },
];

interface BenefitProps {
  bg: string;
}

export default function Benefit({ bg }: BenefitProps) {
  return (
    <section className="relative overflow-hidden py-20">
      <Image src={bg} alt="" fill sizes="100vw" className="object-cover object-center" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-5">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[13px] font-medium text-[#c90f45]">가전 구독하면 무엇이 좋은가요?</p>
          <h2 className="text-[20px] sm:text-[24px] md:text-[30px] font-black leading-[1.3] tracking-[-0.05em] text-[#1a1a1a]">
            일시불과 차이없는 가격!
            <br />
            부담은 지우고 전문가의 빈틈없는 케어를 남겨드립니다.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((item, i) => (
            <div key={i} className="flex items-end justify-between rounded-2xl bg-white px-6 sm:px-8 py-6 sm:py-8 shadow-sm">
              <p className="whitespace-pre-line text-[1.4rem] sm:text-[1.75rem] md:text-[2rem] font-black leading-[1.35] tracking-[-0.04em] text-[#5E4242]">{item.text}</p>
              <Image src={item.icon} alt="" width={160} height={138} className="shrink-0 w-20 sm:w-28 md:w-40 h-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
