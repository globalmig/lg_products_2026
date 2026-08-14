import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productsServer";
import { buildProductMetadata, notFoundMetadata } from "@/lib/productMetadata";
import ProductDetailPage from "@/components/ProductDetailPage";
import ProductJsonLd from "@/components/ProductJsonLd";

const SECTION = "air";
const SECTION_LABEL = "에어케어";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) return notFoundMetadata();
  return buildProductMetadata(product, SECTION);
}

export default async function AirDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} section={SECTION} />
      <ProductDetailPage
        product={product}
        breadcrumb={[{ label: SECTION_LABEL, href: "/products/air" }]}
        section={SECTION}
      />
    </>
  );
}
