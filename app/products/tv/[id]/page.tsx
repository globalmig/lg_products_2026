import { notFound } from "next/navigation";
import { tvProducts } from "@/data/tvProducts";
import ProductDetailPage from "@/components/ProductDetailPage";

export function generateStaticParams() {
  return tvProducts.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = tvProducts.find((p) => p.id === Number(id));
  return { title: product ? `${product.name} | LG전자 BEST SHOP` : "상품 상세" };
}

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = tvProducts.find((p) => p.id === Number(id));
  if (!product) notFound();

  return (
    <ProductDetailPage
      product={product}
      breadcrumb={[{ label: "TV", href: "/products/tv" }]}
    />
  );
}
