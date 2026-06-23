"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productStore, type ManagedProduct } from "@/lib/productStore";
import ProductDetailPage from "@/components/ProductDetailPage";

export default function AirDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ManagedProduct | null | undefined>(undefined);

  useEffect(() => {
    productStore.products.getBySection("air").then((products) => {
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
      breadcrumb={[{ label: "에어케어", href: "/products/air" }]}
    />
  );
}
