import { Suspense } from "react";
import AirProductList from "@/components/AirProductList";

export const metadata = {
  title: "에어컨/에어케어 | LG전자 BEST SHOP",
  description: "LG전자 BEST SHOP 에어컨/에어케어 렌탈 가전 구독 상품 목록",
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
