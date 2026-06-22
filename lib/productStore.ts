import { kitchenProducts, kitchenCategories } from "@/data/kitchenProducts";
import { tvProducts, tvCategories } from "@/data/tvProducts";
import { airProducts, airCategories } from "@/data/airProducts";
import { livingProducts, livingCategories } from "@/data/livingProducts";

export type Section = "kitchen" | "tv" | "air" | "living";

export interface ManagedProduct {
  id: string;
  section: Section;
  category: string;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  tags: { label: string; type: string }[];
  image: string;
  detailImage?: string;
  isBest: boolean;
  order: number;
}

export interface ManagedCategory {
  id: string;
  section: Section;
  name: string;
  order: number;
}

export const SECTION_LABELS: Record<Section, string> = {
  kitchen: "주방가전",
  tv: "TV",
  air: "에어케어",
  living: "생활가전",
};

const ALL_SECTIONS: Section[] = ["kitchen", "tv", "air", "living"];

function buildDefaultProducts(): ManagedProduct[] {
  const result: ManagedProduct[] = [];
  let order = 0;
  const add = (
    section: Section,
    items: { id: number; category: string; name: string; model: string; monthlyPrice: number; benefitPrice: number | null; tags: { label: string; type: string }[]; image: string; isBest?: boolean }[]
  ) => {
    items.forEach((p) => {
      result.push({ ...p, id: `${section}_${p.id}`, section, isBest: p.isBest ?? false, order: order++ });
    });
  };
  add("kitchen", kitchenProducts);
  add("tv", tvProducts);
  add("air", airProducts);
  add("living", livingProducts);
  return result;
}

function buildDefaultCategories(): ManagedCategory[] {
  const result: ManagedCategory[] = [];
  const addCats = (section: Section, cats: readonly string[]) => {
    cats.forEach((name, i) => result.push({ id: `${section}_cat_${i}`, section, name, order: i }));
  };
  addCats("kitchen", kitchenCategories);
  addCats("tv", tvCategories);
  addCats("air", airCategories);
  addCats("living", livingCategories);
  return result;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const productStore = {
  products: {
    get: async (section?: Section): Promise<ManagedProduct[]> => {
      try {
        const url = section ? `/api/products?section=${section}` : `/api/products`;
        const data = await apiFetch<ManagedProduct[]>(url);
        if (data.length === 0) {
          const defaults = buildDefaultProducts();
          return section ? defaults.filter((p) => p.section === section) : defaults;
        }
        return data;
      } catch {
        const defaults = buildDefaultProducts();
        return section ? defaults.filter((p) => p.section === section).sort((a, b) => a.order - b.order) : defaults;
      }
    },
    getBySection: (section: Section) => productStore.products.get(section),
    setForSection: (section: Section, items: ManagedProduct[]) =>
      apiFetch(`/api/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, items }),
      }),
    delete: (id: string) => apiFetch(`/api/products/${id}`, { method: "DELETE" }),
    reset: () =>
      Promise.all(
        ALL_SECTIONS.map((section) =>
          productStore.products.setForSection(
            section,
            buildDefaultProducts().filter((p) => p.section === section)
          )
        )
      ),
  },
  categories: {
    get: async (section?: Section): Promise<ManagedCategory[]> => {
      try {
        const url = section ? `/api/product-categories?section=${section}` : `/api/product-categories`;
        const data = await apiFetch<ManagedCategory[]>(url);
        if (data.length === 0) {
          const defaults = buildDefaultCategories();
          return section ? defaults.filter((c) => c.section === section) : defaults;
        }
        return data;
      } catch {
        const defaults = buildDefaultCategories();
        return section ? defaults.filter((c) => c.section === section).sort((a, b) => a.order - b.order) : defaults;
      }
    },
    getBySection: (section: Section) => productStore.categories.get(section),
    setForSection: (section: Section, items: ManagedCategory[]) =>
      apiFetch(`/api/product-categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, items }),
      }),
    delete: (id: string) => apiFetch(`/api/product-categories/${id}`, { method: "DELETE" }),
    reset: () =>
      Promise.all(
        ALL_SECTIONS.map((section) =>
          productStore.categories.setForSection(
            section,
            buildDefaultCategories().filter((c) => c.section === section)
          )
        )
      ),
  },
};
