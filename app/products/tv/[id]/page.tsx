import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productsServer";
import { buildProductMetadata, notFoundMetadata } from "@/lib/productMetadata";
import ProductDetailPage from "@/components/ProductDetailPage";
import ProductJsonLd from "@/components/ProductJsonLd";

const SECTION = "tv";
const SECTION_LABEL = "TV";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) return notFoundMetadata();
  return buildProductMetadata(product, SECTION);
}

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(SECTION, id);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} section={SECTION} />
      <ProductDetailPage
        product={product}
        breadcrumb={[{ label: SECTION_LABEL, href: "/products/tv" }]}
        section={SECTION}
      />
    </>
  );
}
