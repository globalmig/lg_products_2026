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
    cats.forEach((name, i) => {
      result.push({ id: `${section}_cat_${i}`, section, name, order: i });
    });
  };
  addCats("kitchen", kitchenCategories);
  addCats("tv", tvCategories);
  addCats("air", airCategories);
  addCats("living", livingCategories);
  return result;
}

function load<T>(key: string, fallback: () => T): T {
  if (typeof window === "undefined") return fallback();
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback();
  } catch {
    return fallback();
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const productStore = {
  products: {
    get: () => load<ManagedProduct[]>("admin_products", buildDefaultProducts),
    set: (v: ManagedProduct[]) => save("admin_products", v),
    getBySection: (section: Section) =>
      load<ManagedProduct[]>("admin_products", buildDefaultProducts)
        .filter((p) => p.section === section)
        .sort((a, b) => a.order - b.order),
    reset: () => save("admin_products", buildDefaultProducts()),
  },
  categories: {
    get: () => load<ManagedCategory[]>("admin_categories", buildDefaultCategories),
    set: (v: ManagedCategory[]) => save("admin_categories", v),
    getBySection: (section: Section) =>
      load<ManagedCategory[]>("admin_categories", buildDefaultCategories)
        .filter((c) => c.section === section)
        .sort((a, b) => a.order - b.order),
    reset: () => save("admin_categories", buildDefaultCategories()),
  },
};
