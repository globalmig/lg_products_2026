import { Suspense } from "react";
import TVProductList from "@/components/TVProductList";

export const metadata = {
  title: "TV",
  description: "LG OLED·QNED TV를 월 구독료로 이용하세요. 최신 모델을 합리적인 비용으로 경험해보세요.",
};

export default function TVPage() {
  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">TV</h1>
        </div>
      </div>

      <Suspense>
        <TVProductList />
      </Suspense>
    </main>
  );
}
