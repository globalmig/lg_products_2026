import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getSectionLabel } from "@/lib/productsServer";
import { buildProductMetadata, notFoundMetadata } from "@/lib/productMetadata";
import ProductDetailPage from "@/components/ProductDetailPage";
import ProductJsonLd from "@/components/ProductJsonLd";

export async function generateMetadata({ params }: { params: Promise<{ section: string; id: string }> }): Promise<Metadata> {
  const { section, id } = await params;
  const product = await getProductById(section, id);
  if (!product) return notFoundMetadata();
  return buildProductMetadata(product, section);
}

export default async function SectionProductDetailPage({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  const [product, label] = await Promise.all([getProductById(section, id), getSectionLabel(section)]);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} section={section} />
      <ProductDetailPage
        product={product}
        breadcrumb={[{ label: label ?? section, href: `/products/${section}` }]}
        section={section}
      />
    </>
  );
}
