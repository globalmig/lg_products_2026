import { kitchenProducts } from "./kitchenProducts";
import { tvProducts } from "./tvProducts";
import { airProducts } from "./airProducts";
import { livingProducts } from "./livingProducts";
import { benefitPosts } from "./benefitPosts";

export type SearchResult = {
  type: "product" | "post";
  title: string;
  subtitle: string;
  href: string;
};

const productToResult = (
  p: { name: string; model: string; category: string },
  basePath: string
): SearchResult => ({
  type: "product",
  title: p.name,
  subtitle: p.model,
  href: `${basePath}?category=${encodeURIComponent(p.category)}`,
});

export const searchIndex: SearchResult[] = [
  ...kitchenProducts.map((p) => productToResult(p, "/products/kitchen")),
  ...tvProducts.map((p) => productToResult(p, "/products/tv")),
  ...airProducts.map((p) => productToResult(p, "/products/air")),
  ...livingProducts.map((p) => productToResult(p, "/products/living")),
  ...benefitPosts.map((p) => ({
    type: "post" as const,
    title: p.title,
    subtitle: `${p.category} · ${p.date}`,
    href: `/benefit/${p.slug}`,
  })),
];

export function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return searchIndex
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    )
    .slice(0, 8);
}
