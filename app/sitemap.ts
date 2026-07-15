import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/productsServer";
import { SITE_URL } from "@/lib/siteConfig";

// D1 바인딩은 빌드 타임이 아닌 요청 시점에만 접근 가능하므로 정적 생성을 막는다.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/products/kitchen",
  "/products/tv",
  "/products/air",
  "/products/living",
  "/subscription",
  "/consult",
  "/news",
  "/benefit",
  "/sme",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const products = await getAllProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.section}/${product.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries];
}
