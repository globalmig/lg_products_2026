import { slides as defaultSlides, type Slide } from "@/data/slides";

export type { Slide };

export interface Manager {
  id: string;
  img_key: string;
  name: string;
  store: string;
  tags: string[];
  desc: string;
  href: string;
  sort_order?: number;
}

export interface ConsultSubmission {
  id: string;
  name: string;
  phone: string;
  // Legacy fields
  purpose?: string;
  area?: string;
  apartment?: string;
  channels?: string[];
  model?: string;
  // New subscription form fields
  selectedProducts?: { id: string; name: string; model: string; image: string }[];
  careType?: string;
  availableTime?: string;
  extra?: string;
  submitted_at: string;
  status: "new" | "inProgress" | "completed";
  memo?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface FeatureBanner {
  image_key: string;
  subtitle: string;
  title: string;
  button_label: string;
  href: string;
}

export interface MainCategoryItem {
  id: string;
  label: string;
  href: string;
  image: string;
  bg: string;
  sort_order: number;
}

export interface EventProductRef {
  id: string;
  product_id: string;
  sort_order?: number;
}

const DEFAULT_SLIDES: Slide[] = defaultSlides;

const DEFAULT_FEATURE_BANNER: FeatureBanner = {
  image_key: "",
  subtitle: "말로 해서 더 편리한 정수기",
  title: "LG PuriCare | Objet Collection",
  button_label: "제품 페이지 바로가기",
  href: "/products/kitchen",
};

const DEFAULT_MANAGERS: Manager[] = [
  {
    id: "1",
    img_key: "",
    name: "이원표 지점장",
    store: "용산전자상가점",
    tags: ["구독 전문", "진철", "혼수 & 이사 전문"],
    desc: "현실적인 컨설팅",
    href: "https://map.naver.com/p/search/lg%EB%B2%A0%EC%8A%A4%ED%8A%B8%EC%83%B5%20%EC%9A%A9%EC%82%B0%EC%A0%90/place/33706664?placePath=/ticket",
  },
  {
    id: "2",
    img_key: "",
    name: "장수석 부장님",
    store: "용산전자상가점",
    tags: ["구독전문", "진철", "혼수 패키지"],
    desc: "꼼꼼한 설명",
    href: "https://map.naver.com/p/search/lg%EB%B2%A0%EC%8A%A4%ED%8A%B8%EC%83%B5%20%EC%9A%A9%EC%82%B0%EC%A0%90/place/33706664?placePath=/ticket",
  },
];

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { key } = await apiFetch<{ key: string }>(`/api/upload?folder=${folder}`, {
    method: "POST",
    body: form,
  });
  return key;
}

export function imageUrl(key: string | null | undefined): string {
  if (!key) return "";
  if (key.startsWith("/") || key.startsWith("http")) return key;
  return `/api/images/${key}`;
}

export const adminStore = {
  slides: {
    get: async (): Promise<(Slide & { image_key: string })[]> => {
      try {
        const rows = await apiFetch<{ id: number; image_key: string; subtitle: string; title: string }[]>("/api/slides");
        return rows.map((r) => ({ id: r.id, image: imageUrl(r.image_key), image_key: r.image_key, subtitle: r.subtitle, title: r.title }));
      } catch {
        return DEFAULT_SLIDES.map((s) => ({ ...s, image_key: s.image }));
      }
    },
    add: (slide: { image_key: string; subtitle: string; title: string; sort_order?: number }) =>
      apiFetch("/api/slides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(slide) }),
    update: (id: number, slide: { image_key: string; subtitle: string; title: string; sort_order?: number }) =>
      apiFetch(`/api/slides/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(slide) }),
    delete: (id: number) => apiFetch(`/api/slides/${id}`, { method: "DELETE" }),
  },

  managers: {
    get: () => apiFetch<Manager[]>("/api/managers").catch(() => DEFAULT_MANAGERS),
    add: (m: Manager) =>
      apiFetch("/api/managers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) }),
    update: (id: string, m: Partial<Manager>) =>
      apiFetch(`/api/managers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) }),
    delete: (id: string) => apiFetch(`/api/managers/${id}`, { method: "DELETE" }),
  },

  consult: {
    get: () => apiFetch<ConsultSubmission[]>("/api/consult").catch(() => []),
    add: (sub: ConsultSubmission) =>
      apiFetch("/api/consult", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) }),
    updateStatus: (id: string, status: ConsultSubmission["status"]) =>
      apiFetch(`/api/consult/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    updateMemo: (id: string, memo: string) =>
      apiFetch(`/api/consult/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memo }) }),
    delete: (id: string) => apiFetch(`/api/consult/${id}`, { method: "DELETE" }),
  },

  featureBanner: {
    get: () => apiFetch<FeatureBanner>("/api/feature-banner").catch(() => DEFAULT_FEATURE_BANNER),
    set: (b: FeatureBanner) =>
      apiFetch("/api/feature-banner", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }),
  },

  posts: {
    get: (type: "benefit" | "smallbiz") => apiFetch<Post[]>(`/api/posts?type=${type}`).catch(() => []),
    add: (type: "benefit" | "smallbiz", p: Omit<Post, "id" | "created_at">) =>
      apiFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Date.now().toString(), type, ...p, created_at: new Date().toISOString() }),
      }),
    update: (id: string, p: Partial<Post>) =>
      apiFetch(`/api/posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }),
    delete: (id: string) => apiFetch(`/api/posts/${id}`, { method: "DELETE" }),
  },

  mainCategories: {
    get: () => apiFetch<MainCategoryItem[]>("/api/categories").catch(() => []),
    set: (items: MainCategoryItem[]) =>
      apiFetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items) }),
    delete: (id: string) => apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
  },

  eventProducts: {
    get: () => apiFetch<EventProductRef[]>("/api/event-products").catch(() => []),
    set: (items: EventProductRef[]) =>
      apiFetch("/api/event-products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items) }),
    delete: (id: string) => apiFetch(`/api/event-products/${id}`, { method: "DELETE" }),
  },
};
