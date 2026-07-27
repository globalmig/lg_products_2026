// 새 테이블/스키마 변경 없이 기존 site_settings key-value 테이블에 JSON 배열로 저장한다.
// (lib/productsServer.ts의 HIDDEN_PRODUCT_IDS_KEY와 동일한 패턴)
export const PRODUCT_BUNDLES_KEY = "product_bundles";

export interface ProductBundleItem {
  section: string;
  productId: string;
}

export interface ProductBundle {
  id: string;
  name: string;
  items: ProductBundleItem[];
  discountPercent: number;
  sortOrder: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const bundleStore = {
  get: (): Promise<ProductBundle[]> => apiFetch<ProductBundle[]>("/api/product-bundles").catch(() => []),
  setAll: (items: ProductBundle[]) =>
    apiFetch("/api/product-bundles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }),
};
