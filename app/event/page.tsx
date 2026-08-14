import { getAllBundlesWithProducts } from "@/lib/productsServer";
import PackageList from "@/components/PackageList";

export const metadata = {
  title: "기획전",
  description: "LG전자 베스트샵 기획전 - 여러 상품을 함께 구독하면 할인되는 패키지 상품을 확인하세요.",
  alternates: { canonical: "/event" },
};

export default async function EventPage() {
  const bundles = await getAllBundlesWithProducts();

  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">기획전</h1>
        </div>
      </div>

      <div className="mx-auto max-w-270 px-5 py-8 sm:py-10">
        <PackageList bundles={bundles} />
      </div>
    </main>
  );
}
