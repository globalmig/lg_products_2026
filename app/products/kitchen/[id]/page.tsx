"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { productStore, type ManagedProduct } from "@/lib/productStore";
import ProductDetailPage from "@/components/ProductDetailPage";

export default function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ManagedProduct | null | undefined>(undefined);

  useEffect(() => {
    productStore.products.getBySection("kitchen").then((products) => {
      setProduct(products.find((p) => p.id === id) ?? null);
    });
  }, [id]);

  if (product === undefined) return <div className="min-h-screen bg-white" />;
  if (product === null) return (
    <div className="flex min-h-screen items-center justify-center text-[14px] text-[#999]">
      상품을 찾을 수 없습니다.
    </div>
  );

  return (
    <ProductDetailPage
      product={product}
      breadcrumb={[{ label: "주방가전", href: "/products/kitchen" }]}
      section="kitchen"
    />
  );
}
