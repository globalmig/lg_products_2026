import { Suspense } from "react";
import TVProductList from "@/components/TVProductList";

export const metadata = {
  title: "TV | LG전자 BEST SHOP",
  description: "LG전자 BEST SHOP TV 렌탈 가전 구독 상품 목록",
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
