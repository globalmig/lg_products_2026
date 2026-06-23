import { Suspense } from "react";
import LivingProductList from "@/components/LivingProductList";

export const metadata = {
  title: "생활가전",
  description: "LG 세탁기·건조기·스타일러·청소기를 월 구독료로 이용하세요. 설치·AS 포함.",
};

export default function LivingPage() {
  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">생활가전</h1>
        </div>
      </div>

      <Suspense>
        <LivingProductList />
      </Suspense>
    </main>
  );
}
