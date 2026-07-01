"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productStore, type ManagedProduct } from "@/lib/productStore";
import ProductDetailPage from "@/components/ProductDetailPage";

export default function SectionProductDetailPage() {
  const { section, id } = useParams<{ section: string; id: string }>();
  const [product, setProduct] = useState<ManagedProduct | null | undefined>(undefined);
  const [label, setLabel] = useState(section);

  useEffect(() => {
    productStore.products.getBySection(section).then((products) => {
      setProduct(products.find((p) => p.id === id) ?? null);
    });
    productStore.sections.get().then((sections) => {
      const match = sections.find((s) => s.id === section);
      if (match) setLabel(match.label);
    });
  }, [section, id]);

  if (product === undefined) return <div className="min-h-screen bg-white" />;
  if (product === null) return (
    <div className="flex min-h-screen items-center justify-center text-[14px] text-[#999]">
      상품을 찾을 수 없습니다.
    </div>
  );

  return (
    <ProductDetailPage
      product={product}
      breadcrumb={[{ label, href: `/products/${section}` }]}
      section={section}
    />
  );
}
