import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소상공인 혜택",
  description:
    "소상공인 전용 혜택을 확인하세요. 업소용 가전 구독·렌탈로 초기 비용 없이 운영하세요.",
};

export default function SmeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
