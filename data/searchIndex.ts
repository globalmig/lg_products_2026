import { productStore } from "@/lib/productStore";
import { adminStore } from "@/lib/adminStore";

export type SearchResult = {
  type: "product" | "post";
  title: string;
  subtitle: string;
  href: string;
};

// 검색 대상 텍스트: 상품명뿐 아니라 모델번호·카테고리(냉장고, 정수기 등)까지 포함해야
// "제품 코드"나 카테고리명으로 검색했을 때도 걸리므로, 이 필드들을 모두 합쳐서 매칭한다.
// 모델번호는 "S9CT-1CS"처럼 하이픈·공백 표기가 제각각이라, 하이픈·공백을 제거한
// 버전(haystackCode)도 함께 만들어 표기가 달라도 코드 검색이 되게 한다.
type IndexedResult = SearchResult & { haystack: string; haystackCode: string };

const stripCodeChars = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");

// 실제 자사몰에 노출 중인(관리자 화면에서 등록·수정한) 상품과, 실제 "이달의 소식" 게시글을 불러와
// 검색 인덱스를 만든다. 예전에는 코드에 하드코딩된 정적 상품 목록을 검색했기 때문에, 이후 관리자
// 화면에서 새로 추가하거나 이름을 바꾼 상품·카테고리(예: 냉장고, 정수기)가 검색되지 않는 문제가 있었다.
export async function buildSearchIndex(): Promise<IndexedResult[]> {
  const [products, posts] = await Promise.all([
    productStore.products.get().catch(() => []),
    adminStore.posts.get("benefit").catch(() => []),
  ]);

  const productResults: IndexedResult[] = products.map((p) => ({
    type: "product",
    title: p.name,
    subtitle: [p.model, p.category].filter(Boolean).join(" · "),
    href: `/products/${p.section}/${p.id}`,
    haystack: [p.name, p.model, p.category].filter(Boolean).join(" ").toLowerCase(),
    haystackCode: stripCodeChars(p.model ?? ""),
  }));

  const postResults: IndexedResult[] = posts.map((p) => ({
    type: "post",
    title: p.title,
    subtitle: new Date(p.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
    href: `/benefit/${p.id}`,
    haystack: p.title.toLowerCase(),
    haystackCode: "",
  }));

  return [...productResults, ...postResults];
}

export function search(query: string, index: IndexedResult[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qCode = stripCodeChars(query);
  return index
    .filter((item) => item.haystack.includes(q) || (qCode.length >= 2 && item.haystackCode.includes(qCode)))
    .slice(0, 8);
}
