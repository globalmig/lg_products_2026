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

export interface EventPost {
  id: string;
  title: string;
  subtitle: string;
  image_key: string;
  link: string;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  stars: number;
  image_key: string;
  content: string;
  name: string;
  product: string;
  date: string;
  sort_order: number;
}

export interface CardDiscount {
  id: string;
  name: string;
  discount: number;
  image_key: string;
  sort_order: number;
  card_detail_json?: string | null;
}

const DEFAULT_REVIEWS: Review[] = [
  { id: "r1", stars: 5, image_key: "", content: "\"상담부터 설치까지 꼼꼼하게 챙겨주셔서 정말 만족스러웠어요. 제품도 생각보다 훨씬 조용하고 공간 활용이 좋네요. 매니저님이 색상 조합까지 같이 고민해줘서 인테리어에도 딱 맞게 선택했습니다.\"", name: "김*현", product: "LG 디오스 오브제컬렉션 냉장고", date: "2026.05.18", sort_order: 0 },
  { id: "r2", stars: 5, image_key: "", content: "\"구독 서비스가 이렇게 편할 줄 몰랐어요. 설치도 빠르고 관리까지 해준다니 너무 좋아요. 용산점 매니저분이 실제 사용 팁도 알려주셔서 처음 사용하는 데 전혀 어렵지 않았습니다.\"", name: "박*은", product: "LG 워시타워 렌탈 가전 구독", date: "2026.05.12", sort_order: 1 },
  { id: "r3", stars: 5, image_key: "", content: "\"혼자 사는데 거실에 두기 딱 좋은 사이즈예요. 가격 대비 화질이 정말 좋고, 배터리로 어디서나 볼 수 있어서 활용도가 높아요. 매장에서 직접 비교하고 구매할 수 있어서 좋았습니다.\"", name: "이*준", product: "LG 스탠바이미 2 렌탈 가전 구독", date: "2026.04.29", sort_order: 2 },
];

const DEFAULT_CARD_DISCOUNTS: CardDiscount[] = [
  { id: "woori-platinum", name: "[우리] LG전자 우리카드 Platinum", discount: 42000, image_key: "cards/woori-platinum.jpg", sort_order: 0 },
  { id: "lotte",          name: "[롯데] LG구독엔로카",             discount: 26000, image_key: "cards/lotte.jpg",          sort_order: 1 },
  { id: "woori",          name: "[우리] LG전자 우리카드",          discount: 24000, image_key: "cards/woori.jpg",           sort_order: 2 },
  { id: "kb",             name: "[KB국민] LG전자 KB국민",          discount: 22000, image_key: "cards/kb.jpg",             sort_order: 3 },
  { id: "shinhan",        name: "[신한] LG전자 The 구독케어",      discount: 30000, image_key: "cards/shinhan.jpg",        sort_order: 4 },
  { id: "nh",             name: "[NH] 올원 LG전자 BEST",           discount: 20000, image_key: "cards/nh.jpg",             sort_order: 5 },
  { id: "jeonbuk",        name: "[전북] 베스트케어",               discount: 20000, image_key: "cards/jeonbuk.jpg",        sort_order: 6 },
  { id: "gwangju",        name: "[광주] 베스트케어",               discount: 20000, image_key: "cards/gwangju.jpg",        sort_order: 7 },
  { id: "hyundai",        name: "[현대] LG전자 현대카드",          discount: 19000, image_key: "cards/hyundai.jpg",        sort_order: 8 },
];

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

  eventPosts: {
    get: () => apiFetch<EventPost[]>("/api/event-posts").catch(() => []),
    add: (p: EventPost) =>
      apiFetch("/api/event-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }),
    update: (id: string, p: Partial<EventPost>) =>
      apiFetch(`/api/event-posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }),
    delete: (id: string) => apiFetch(`/api/event-posts/${id}`, { method: "DELETE" }),
  },

  reviews: {
    get: () => apiFetch<Review[]>("/api/reviews").catch(() => DEFAULT_REVIEWS),
    add: (r: Review) =>
      apiFetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) }),
    update: (id: string, r: Partial<Review>) =>
      apiFetch(`/api/reviews/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) }),
    delete: (id: string) => apiFetch(`/api/reviews/${id}`, { method: "DELETE" }),
  },

  cardDiscounts: {
    get: () => apiFetch<CardDiscount[]>("/api/card-discounts").catch(() => DEFAULT_CARD_DISCOUNTS),
    add: (card: CardDiscount) =>
      apiFetch("/api/card-discounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(card) }),
    update: (id: string, card: Omit<CardDiscount, "id">) =>
      apiFetch(`/api/card-discounts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(card) }),
    delete: (id: string) => apiFetch(`/api/card-discounts/${id}`, { method: "DELETE" }),
  },

  siteSettings: {
    get: () => apiFetch<{ storeName: string; copyright: string; privacyContent: string; termsContent: string; footerInfo: { id: string; label: string; value: string }[] }>("/api/site-settings").catch(() => ({
      storeName: "용산전자상가점",
      copyright: "© 2025 LG Electronics Inc. All rights reserved.",
      privacyContent: "",
      termsContent: "",
      footerInfo: [],
    })),
    set: (data: { storeName?: string; copyright?: string; privacyContent?: string; termsContent?: string; footerInfo?: { id: string; label: string; value: string }[] }) =>
      apiFetch("/api/site-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  },
};
