import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundleWithProducts } from "@/lib/productsServer";
import { bundleHeadline } from "@/lib/productBundles";
import PackageDetailPage from "@/components/PackageDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const resolved = await getBundleWithProducts(id);
  if (!resolved) return { title: "페이지를 찾을 수 없습니다" };
  return {
    title: bundleHeadline(resolved.bundle),
    description: `${resolved.products.map((p) => p.name).join(" + ")} 패키지 구독 시 ${resolved.bundle.discountPercent}% 할인 혜택을 받아보세요.`,
    alternates: { canonical: `/event/${id}` },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await getBundleWithProducts(id);
  if (!resolved) notFound();

  return (
    <PackageDetailPage
      bundle={resolved.bundle}
      products={resolved.products}
      breadcrumb={[{ label: "기획전", href: "/event" }]}
    />
  );
}
