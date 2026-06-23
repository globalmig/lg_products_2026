import { Suspense } from "react";
import AirProductList from "@/components/AirProductList";

export const metadata = {
  title: "에어컨·에어케어",
  description: "LG 휘센 에어컨, 공기청정기, 에어케어 제품을 월 구독료로 이용하세요. 설치·AS 포함.",
};

export default function AirPage() {
  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">에어컨/에어케어</h1>
        </div>
      </div>

      <Suspense>
        <AirProductList />
      </Suspense>
    </main>
  );
}
