"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStore, type FeatureBanner } from "@/lib/adminStore";

const DEFAULT: FeatureBanner = {
  image_key: "",
  subtitle: "말로 해서 더 편리한 정수기",
  title: "LG PuriCare | Objet Collection",
  button_label: "제품 페이지 바로가기",
  href: "/products/kitchen",
};

export default function FeatureBannerSection() {
  const [banner, setBanner] = useState<FeatureBanner>(DEFAULT);

  useEffect(() => {
    adminStore.featureBanner.get().then((data) => {
      if (data) setBanner(data);
    });
  }, []);

  const isExternal = banner.href?.startsWith("http") ?? false;

  const content = (
    <div
      className="relative mx-5 overflow-hidden rounded-2xl lg:mx-auto lg:max-w-360"
      style={{ minHeight: "260px" }}
    >
      {/* 배경 이미지 */}
      {banner.image_key ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.image_key}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e8e8e8] to-[#d0d0d0]" />
      )}

      {/* 텍스트 오버레이 */}
      <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-center px-10 py-12 md:px-16">
        <p className="mb-1.5 text-[12px] sm:text-[14px] font-medium tracking-[-0.02em] text-[#333]">
          {banner.subtitle}
        </p>
        <h2 className="mb-6 text-[20px] sm:text-[28px] md:text-[34px] font-black leading-tight tracking-[-0.04em] text-[#1a1a1a]">
          {banner.title}
        </h2>
        <div>
          <span className="inline-flex items-center rounded-full bg-white/70 px-6 py-2.5 text-[14px] font-semibold text-[#1a1a1a] backdrop-blur-sm transition-colors hover:bg-white/90">
            {banner.button_label}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-8">
      {isExternal ? (
        <a href={banner.href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        <Link href={banner.href} className="block">
          {content}
        </Link>
      )}
    </section>
  );
}
