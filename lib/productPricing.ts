import type { PeriodPrice, CareServiceItem, ColorItem } from "./productStore";

// ManagedProduct/DetailProduct(컴포넌트별 로컬 타입) 양쪽 모두를 그대로 받을 수 있도록,
// 가격 계산에 실제로 필요한 필드만 뽑은 최소 구조 타입을 사용한다.
export interface PricingInput {
  monthlyPrice: number;
  price60?: number | null;
  price48?: number | null;
  price36?: number | null;
  periodPrices?: PeriodPrice[];
  careServiceItems?: CareServiceItem[];
  colorItems?: ColorItem[];
  careService?: string;
  manageCycle?: string;
  color?: string;
  image?: string;
}

// 계약기간별 가격 목록. periodPrices가 있으면 그대로, 없으면 레거시 price60/48/36/monthlyPrice로 구성한다.
export function getPeriodPrices(p: PricingInput): PeriodPrice[] {
  if (p.periodPrices && p.periodPrices.length > 0) return p.periodPrices;
  const pp: PeriodPrice[] = [];
  if (p.monthlyPrice) pp.push({ label: "72개월", price: p.monthlyPrice });
  if (p.price60 != null) pp.push({ label: "60개월", price: p.price60 });
  if (p.price48 != null) pp.push({ label: "48개월", price: p.price48 });
  if (p.price36 != null) pp.push({ label: "36개월", price: p.price36 });
  return pp;
}

export function getCareServiceItems(p: PricingInput): CareServiceItem[] {
  if (p.careServiceItems && p.careServiceItems.length > 0) return p.careServiceItems;
  if (p.careService || p.manageCycle) return [{ label: p.careService ?? "", cycle: p.manageCycle ?? "" }];
  return [];
}

export function getColorItems(p: PricingInput): ColorItem[] {
  if (p.colorItems && p.colorItems.length > 0) return p.colorItems;
  if (p.color) return [{ name: p.color, image: p.image ?? "" }];
  return [];
}

// 케어서비스별 계약기간 매트릭스가 있으면 (계약기간 × 케어서비스) 조합의 가격을 사용하고,
// 없으면 계약기간 자체에 매겨진 가격을 그대로 사용한다.
export function hasCareMatrix(careItems: CareServiceItem[]): boolean {
  return careItems.some((ci) => (ci.prices?.length ?? 0) > 0);
}

export function resolvePrice(careItems: CareServiceItem[], period?: PeriodPrice, careIdx?: number | null): number | undefined {
  if (!period) return undefined;
  if (!hasCareMatrix(careItems)) return period.price;
  if (careIdx == null) return undefined;
  return careItems[careIdx]?.prices?.find((pr) => pr.period === period.label)?.price;
}

// 상품이 실제로 선택 가능한 계약기간 라벨 목록. 케어서비스 매트릭스가 있으면 전체 케어서비스
// 항목을 통틀어 값이 있는 기간들의 합집합, 없으면 getPeriodPrices의 라벨 그대로 사용한다.
export function availablePeriodLabels(p: PricingInput): string[] {
  const careItems = getCareServiceItems(p);
  if (hasCareMatrix(careItems)) {
    const labels = new Set<string>();
    careItems.forEach((ci) => (ci.prices ?? []).forEach((pr) => { if (Number.isFinite(pr.price)) labels.add(pr.period); }));
    return [...labels];
  }
  return getPeriodPrices(p).map((pp) => pp.label);
}

// 여러 상품이 공통으로 가진 계약기간 라벨의 교집합. 등록 순서를 보존하기 위해 첫 상품의 순서를 기준으로 한다.
export function intersectPeriodLabels(products: PricingInput[]): string[] {
  if (products.length === 0) return [];
  const [first, ...rest] = products.map(availablePeriodLabels);
  return first.filter((label) => rest.every((labels) => labels.includes(label)));
}
