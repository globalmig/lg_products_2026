import type { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionContent from "@/components/SubscriptionContent";

export const metadata: Metadata = {
  title: "가전 구독",
  description:
    "LG전자 베스트샵 용산점의 가전 구독 서비스를 소개합니다. 재구독·결합·선납 할인 등 다양한 혜택을 월 구독료로 누리세요.",
  openGraph: {
    title: "가전 구독 | LG전자 베스트샵 용산점",
    description: "재구독·결합·선납 할인 등 다양한 구독 혜택을 확인하세요.",
    url: "/subscription",
  },
};

export default function SubscriptionPage() {
  return (
    <>
      <section className="w-full overflow-hidden">
        <video src="/care-service-kv-pc.mp4" autoPlay muted loop playsInline className="w-full h-auto block" />
      </section>
      <Suspense>
        <SubscriptionContent />
      </Suspense>
    </>
  );
}
