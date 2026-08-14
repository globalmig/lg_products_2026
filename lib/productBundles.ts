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
  // 기획전 상세페이지 타이틀. 비우면 `${name} · ${discountPercent}% 할인`으로 자동 생성한다.
  headline?: string;
  // 기획전/관리자 목록에 쓰는 대표 썸네일 이미지 키. 비우면 첫 번째 구성 상품 이미지를 사용한다.
  thumbnailKey?: string;
}

export function bundleHeadline(bundle: Pick<ProductBundle, "name" | "discountPercent" | "headline">): string {
  return bundle.headline?.trim() || `${bundle.name} · ${bundle.discountPercent}% 할인`;
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
