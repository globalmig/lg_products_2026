import { Suspense } from "react";
import KitchenProductList from "@/components/KitchenProductList";

export const metadata = {
  title: "주방가전 | LG전자 BEST SHOP",
  description: "LG전자 BEST SHOP 주방가전 렌탈 가전 구독 상품 목록",
};

export default function KitchenPage() {
  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">주방가전</h1>
        </div>
      </div>

      <Suspense>
        <KitchenProductList />
      </Suspense>
    </main>
  );
}
