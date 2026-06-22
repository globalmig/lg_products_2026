import type { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionTabs from "@/components/SubscriptionTabs";
import Benefit from "@/components/Benefit";
import BenefitTab from "@/components/BenefitTab";
import CardTab from "@/components/CardTab";

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

function TabContent({ tab }: { tab: string }) {
  if (tab === "benefit") return <BenefitTab />;
  if (tab === "card") return <CardTab />;
  return <Benefit bg="/images/bg_white_benefit.png" />;
}

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "service" } = await searchParams;

  return (
    <>
      <section className="relative h-75 sm:h-105 md:h-140 lg:h-180">
        <video src="https://static.lge.co.kr/kr/caresolutions/images/care-service-kv-pc.mp4" autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover object-center" />
      </section>

      <Suspense>
        <SubscriptionTabs />
      </Suspense>

      <TabContent tab={tab} />
    </>
  );
}
