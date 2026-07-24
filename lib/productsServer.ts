import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ManagedProduct } from "./productStore";
import { R2_PUBLIC_URL } from "./siteConfig";

type DBProduct = {
  id: string; section: string; category: string; name: string; model: string;
  monthly_price: number; benefit_price: number | null; tags: string;
  image: string; detail_image: string; is_best: number; sort_order: number;
  price_60: number | null; price_48: number | null; price_36: number | null;
  care_service: string; manage_cycle: string; color: string; size: string;
  period_prices: string; care_service_items: string; color_items: string;
};

// 노출가격 기준: 모든 케어서비스 항목(주기별) × 모든 계약기간(72/60/48개월)의 가격을 통틀어
// 최솟값을 사용한다. (app/api/products/route.ts와 동일 규칙)
export function monthlyPriceFromCareItems(careServiceItems: { prices?: { period: string; price: number }[] }[], fallback: number): number {
  const allPrices = careServiceItems
    .flatMap((item) => item.prices ?? [])
    .map((p) => p.price)
    .filter((price) => Number.isFinite(price));
  if (allPrices.length === 0) return fallback;
  return Math.min(...allPrices);
}

export function toImageUrl(key: string) {
  if (!key || key.startsWith("/") || key.startsWith("http") || key.trimStart().startsWith("<")) return key;
  return `${R2_PUBLIC_URL}/${key}`;
}

export function toImageKey(url: string) {
  if (!url) return url;
  if (url.startsWith(`${R2_PUBLIC_URL}/`)) return url.slice(`${R2_PUBLIC_URL}/`.length);
  if (url.startsWith("/api/images/")) return url.slice("/api/images/".length);
  return url;
}

export function deserializeProduct(row: DBProduct): ManagedProduct {
  const rawColorItems = JSON.parse(row.color_items || "[]") as { name: string; image: string }[];
  const careServiceItems = JSON.parse(row.care_service_items || "[]") as ManagedProduct["careServiceItems"];
  return {
    id: row.id, section: row.section, category: row.category,
    name: row.name, model: row.model,
    monthlyPrice: monthlyPriceFromCareItems(careServiceItems ?? [], row.monthly_price), benefitPrice: row.benefit_price,
    price60: row.price_60 ?? null, price48: row.price_48 ?? null, price36: row.price_36 ?? null,
    periodPrices: JSON.parse(row.period_prices || "[]"),
    careServiceItems,
    colorItems: rawColorItems.map((c) => ({ ...c, image: toImageUrl(c.image) })),
    tags: JSON.parse(row.tags || "[]"),
    image: toImageUrl(row.image), detailImage: toImageUrl(row.detail_image ?? ""),
    isBest: row.is_best === 1, order: row.sort_order,
    careService: row.care_service ?? "", manageCycle: row.manage_cycle ?? "",
    color: row.color ?? "", size: row.size ?? "",
    isVisible: true,
  };
}

// 상품 노출 on/off는 products 테이블 스키마를 바꾸지 않고, 기존 site_settings 키-값
// 테이블에 숨긴 상품 id 목록만 별도 키로 저장해 관리한다 (끄더라도 상품 데이터 자체는 유지됨).
export const HIDDEN_PRODUCT_IDS_KEY = "hidden_product_ids";

export async function getHiddenProductIds(env: CloudflareEnv): Promise<Set<string>> {
  const row = await env.lg_product_db
    .prepare("SELECT value FROM site_settings WHERE key=?")
    .bind(HIDDEN_PRODUCT_IDS_KEY)
    .first<{ value: string }>();
  return new Set<string>(row?.value ? JSON.parse(row.value) : []);
}

function attachVisibility(products: ManagedProduct[], hidden: Set<string>): ManagedProduct[] {
  return products.map((p) => ({ ...p, isVisible: !hidden.has(p.id) }));
}

// 같은 요청 안에서 generateMetadata와 페이지 렌더링이 각각 호출해도 DB 조회가 한 번만
// 일어나도록 요청 단위로 메모이즈한다.
export const getProductsBySection = cache(async (section: string, includeHidden = false): Promise<ManagedProduct[]> => {
  const { env } = await getCloudflareContext();
  const [{ results }, hidden] = await Promise.all([
    env.lg_product_db
      .prepare("SELECT * FROM products WHERE section=? ORDER BY sort_order ASC")
      .bind(section)
      .all(),
    getHiddenProductIds(env),
  ]);
  const products = attachVisibility((results as DBProduct[]).map(deserializeProduct), hidden);
  return includeHidden ? products : products.filter((p) => p.isVisible);
});

// 노출을 꺼도 상세페이지 경로 자체는 그대로 접근 가능해야 하므로(목록·메인화면에서만 숨김),
// id로 직접 조회할 때는 숨김 여부와 상관없이 찾는다.
export async function getProductById(section: string, id: string): Promise<ManagedProduct | null> {
  const products = await getProductsBySection(section, true);
  return products.find((p) => p.id === id) ?? null;
}

export async function getAllProducts(includeHidden = false): Promise<ManagedProduct[]> {
  const { env } = await getCloudflareContext();
  const [{ results }, hidden] = await Promise.all([
    env.lg_product_db
      .prepare("SELECT * FROM products ORDER BY section, sort_order ASC")
      .all(),
    getHiddenProductIds(env),
  ]);
  const products = attachVisibility((results as DBProduct[]).map(deserializeProduct), hidden);
  return includeHidden ? products : products.filter((p) => p.isVisible);
}

export const getSectionLabel = cache(async (section: string): Promise<string | null> => {
  const { env } = await getCloudflareContext();
  const row = await env.lg_product_db
    .prepare("SELECT label FROM sections WHERE id=?")
    .bind(section)
    .first<{ label: string }>();
  return row?.label ?? null;
});

export async function getAllSections(): Promise<{ id: string; label: string }[]> {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT id, label FROM sections ORDER BY sort_order ASC")
    .all();
  return results as { id: string; label: string }[];
}
