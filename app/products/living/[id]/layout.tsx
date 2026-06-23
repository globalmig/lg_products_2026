import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "생활가전 상품 상세",
  description: "LG전자 베스트샵 용산점 생활가전 구독·렌탈 상품 상세 정보를 확인하세요.",
};

export default function LivingDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
