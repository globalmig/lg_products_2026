import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productsServer";
import { buildProductMetadata, notFoundMetadata } from "@/lib/productMetadata";
import ProductDetailPage from "@/components/ProductDetailPage";
import ProductJsonLd from "@/components/ProductJsonLd";

const SECTION = "kitchen";
const SECTION_LABEL = "주방가전";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) return notFoundMetadata();
  return buildProductMetadata(product, SECTION);
}

export default async function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} section={SECTION} />
      <ProductDetailPage
        product={product}
        breadcrumb={[{ label: SECTION_LABEL, href: "/products/kitchen" }]}
        section={SECTION}
      />
    </>
  );
}
