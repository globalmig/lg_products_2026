import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "혜택 안내",
  description:
    "LG전자 베스트샵 용산점의 구독 혜택 정보를 확인하세요. 재구독·결합·선납 할인 등 다양한 혜택을 소개합니다.",
};

export default function BenefitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
