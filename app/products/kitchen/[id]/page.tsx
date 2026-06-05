import { notFound } from "next/navigation";
import { kitchenProducts } from "@/data/kitchenProducts";
import ProductDetailPage from "@/components/ProductDetailPage";

export function generateStaticParams() {
  return kitchenProducts.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = kitchenProducts.find((p) => p.id === Number(id));
  return { title: product ? `${product.name} | LG전자 BEST SHOP` : "상품 상세" };
}

export default async function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = kitchenProducts.find((p) => p.id === Number(id));
  if (!product) notFound();

  return (
    <ProductDetailPage
      product={product}
      breadcrumb={[{ label: "주방가전", href: "/products/kitchen" }]}
    />
  );
}
