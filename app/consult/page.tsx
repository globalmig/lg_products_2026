import { Suspense } from "react";
import ConsultForm from "@/components/ConsultForm";

export const metadata = {
  title: "상담 신청",
  description: "LG전자 베스트샵 용산점에 방문 상담을 신청하세요. 가전 구독·렌탈 전문 상담사가 안내해드립니다.",
};

export default function ConsultPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-xl px-5 py-10">
        <h1 className="mb-6 text-[24px] font-black tracking-tighter text-[#1a1a1a]">구독신청</h1>
        <hr className="mb-0 border-[#1a1a1a]" />
        <Suspense>
          <ConsultForm />
        </Suspense>
      </div>
    </main>
  );
}
