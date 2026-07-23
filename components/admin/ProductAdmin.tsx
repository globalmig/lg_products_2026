"use client";

import { useState, useEffect, useRef } from "react";
import { LuPencil, LuTrash2, LuExternalLink, LuEye, LuEyeOff } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import Image from "next/image";
import {
  productStore,
  type Section,
  type ManagedProduct,
  type ManagedCategory,
  type ManagedSection,
  type PeriodPrice,
  type CareServiceItem,
  type ColorItem,
} from "@/lib/productStore";
import { uploadImage } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

const EMPTY_PRODUCT: Omit<ManagedProduct, "id" | "order"> = {
  section: "kitchen",
  category: "",
  name: "",
  model: "",
  monthlyPrice: 0,
  benefitPrice: null,
  price60: null,
  price48: null,
  price36: null,
  periodPrices: [],
  careServiceItems: [],
  colorItems: [],
  tags: [],
  image: "",
  detailImage: "",
  isBest: false,
  careService: "",
  manageCycle: "",
  color: "",
};

function legacyPeriodPrices(p: ManagedProduct): PeriodPrice[] {
  if (p.periodPrices && p.periodPrices.length > 0) return p.periodPrices;
  const pp: PeriodPrice[] = [];
  if (p.monthlyPrice) pp.push({ label: "72개월", price: p.monthlyPrice });
  if (p.price60 != null) pp.push({ label: "60개월", price: p.price60 });
  if (p.price48 != null) pp.push({ label: "48개월", price: p.price48 });
  if (p.price36 != null) pp.push({ label: "36개월", price: p.price36 });
  return pp;
}

function legacyCareServiceItems(p: ManagedProduct): CareServiceItem[] {
  if (p.careServiceItems && p.careServiceItems.length > 0) return p.careServiceItems;
  if (p.careService || p.manageCycle) {
    return [{ label: p.careService ?? "", cycle: p.manageCycle ?? "" }];
  }
  return [];
}

function legacyColorItems(p: ManagedProduct): ColorItem[] {
  if (p.colorItems && p.colorItems.length > 0) return p.colorItems;
  if (p.color) return [{ name: p.color, image: p.image ?? "" }];
  return [];
}

// 엑셀 내보내기/가져오기에서 "케어서비스N_라벨 / 케어서비스N_주기 / 72개월 / 60개월 / 48개월" 컬럼
// 그룹을 다루기 위한 헬퍼. 구독료는 계약기간 × 케어서비스 매트릭스이지만, 실제로는 72/60/48개월
// 세 종류가 대부분이라 이 세 기간만 고정 컬럼으로 분리해 셀 단위로 바로 수정할 수 있게 한다.
// 72/60/48개월 컬럼명은 그룹마다 동일하게 반복되므로(케어서비스1_72개월 아님) 이름이 아니라
// "케어서비스N_라벨" 컬럼 바로 다음 위치로 찾아야 한다 (careGroupHeaders 순서와 1:1로 맞춰야 함).
const CARE_GROUP_PERIODS: string[] = ["72개월", "60개월", "48개월"];

// 노출가격(monthlyPrice) 기준: 모든 케어서비스 항목(주기별) × 모든 계약기간(72/60/48개월)의
// 가격을 통틀어 최솟값을 노출한다. 유효한 가격이 하나도 없을 때만 fallback을 쓴다.
function monthlyPriceFromCareItems(careServiceItems: CareServiceItem[], fallback: number): number {
  const allPrices = careServiceItems
    .flatMap((item) => item.prices ?? [])
    .map((p) => p.price)
    .filter((price) => Number.isFinite(price));
  if (allPrices.length === 0) return fallback;
  return Math.min(...allPrices);
}

function careGroupHeaders(count: number): string[] {
  const headers: string[] = [];
  for (let i = 1; i <= count; i++) {
    headers.push(`케어서비스${i}_라벨`, `케어서비스${i}_주기`, ...CARE_GROUP_PERIODS);
  }
  return headers;
}

// 다운로드용: 케어서비스 항목의 prices 배열에서 라벨에 해당 기간(예: "48")이 포함된 가격을 찾는다.
// (관리자 화면에서 계약기간 라벨을 "48개월"처럼 자유 텍스트로 입력하므로 부분 일치로 찾는다.)
function periodPriceFor(cs: CareServiceItem | undefined, keyword: string): number | "" {
  const found = (cs?.prices ?? []).find((pp) => pp.period.includes(keyword));
  return found ? found.price : "";
}

// 케어서비스 매트릭스가 없는(구버전 monthlyPrice/periodPrices만 있는) 상품은 legacyCareServiceItems가
// 빈 배열을 반환해 엑셀 다운로드 시 가격 칸이 통째로 비어버린다. 그 상태로 재업로드하면 가격이 0원이
// 되므로, 매트릭스가 없을 때는 periodPrices를 라벨 없는 케어서비스 그룹 하나로 변환해 내보낸다.
function careItemsForExport(p: ManagedProduct): CareServiceItem[] {
  const items = legacyCareServiceItems(p);
  if (items.length > 0) return items;
  const periods = legacyPeriodPrices(p);
  if (periods.length === 0) return [];
  return [{ label: "", cycle: "", prices: periods.map((pp) => ({ period: pp.label, price: pp.price })) }];
}

// 엑셀 업로드 시 "같은 제품"을 판정하는 기준: 같은 상위카테고리(section) 내에서
// 모델번호가 둘 다 있으면 모델번호로, 없으면 카테고리+상품명으로 동일 제품 여부를 판단한다.
function isSameProduct(existing: ManagedProduct, incoming: Omit<ManagedProduct, "id" | "order">): boolean {
  if (existing.section !== incoming.section) return false;
  const modelA = existing.model.trim().toLowerCase();
  const modelB = incoming.model.trim().toLowerCase();
  if (modelA && modelB) return modelA === modelB;
  return existing.category === incoming.category && existing.name.trim() === incoming.name.trim();
}

/* ────── 상품 편집 모달 ────── */
function ProductModal({
  initial,
  section,
  sections,
  onSave,
  onClose,
}: {
  initial: ManagedProduct | null;
  section: Section;
  sections: ManagedSection[];
  onSave: (p: Omit<ManagedProduct, "id" | "order">) => void | Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<ManagedProduct, "id" | "order">>(
    initial
      ? {
          section: initial.section, category: initial.category, name: initial.name,
          model: initial.model, monthlyPrice: initial.monthlyPrice, benefitPrice: initial.benefitPrice,
          price60: initial.price60 ?? null, price48: initial.price48 ?? null, price36: initial.price36 ?? null,
          periodPrices: legacyPeriodPrices(initial),
          careServiceItems: legacyCareServiceItems(initial),
          colorItems: legacyColorItems(initial),
          tags: initial.tags, image: initial.image, detailImage: initial.detailImage ?? "",
          isBest: initial.isBest, careService: initial.careService ?? "",
          manageCycle: initial.manageCycle ?? "", color: initial.color ?? "",
        }
      : { ...EMPTY_PRODUCT, section, category: "" }
  );
  // 편집 대상 상품이 실제로 속한 상위카테고리(section) 기준으로 카테고리 목록을 따로 불러온다.
  // 부모의 카테고리 목록은 현재 탭(section state) 기준이라, "전체" 탭 등에서 다른 섹션 상품을
  // 수정할 때 엉뚱한 섹션의 카테고리 목록이 보이는 문제가 있었다.
  const [categoriesBySection, setCategoriesBySection] = useState<Record<string, ManagedCategory[]>>({});
  useEffect(() => {
    Promise.all(sections.map((s) => productStore.categories.getBySection(s.id))).then((results) => {
      const map: Record<string, ManagedCategory[]> = {};
      sections.forEach((s, i) => { map[s.id] = [...results[i]].sort((a, b) => a.order - b.order); });
      setCategoriesBySection(map);
      if (!initial) {
        setForm((f) => (f.category ? f : { ...f, category: map[f.section]?.[0]?.name ?? "" }));
      }
    });
  }, [sections]);
  const categories = categoriesBySection[form.section] ?? [];
  const categoryMatched = categories.some((c) => c.name === form.category);
  const [colorFiles, setColorFiles] = useState<(File | null)[]>(
    initial ? (legacyColorItems(initial)).map(() => null) : []
  );
  const [colorPreviews, setColorPreviews] = useState<string[]>(
    initial ? legacyColorItems(initial).map((c) => c.image) : []
  );
  const [tagInput, setTagInput] = useState("");
  const [tagType, setTagType] = useState("naver");
  const [thumbPreview, setThumbPreview] = useState<string>(initial?.image ?? "");
  const [detailPreview, setDetailPreview] = useState<string>(
    initial?.detailImage && !initial.detailImage.startsWith("<") ? initial.detailImage : ""
  );
  const [detailMode, setDetailMode] = useState<"upload" | "url" | "html">(
    initial?.detailImage?.startsWith("<") ? "html" : "upload"
  );
  const [detailUrl, setDetailUrl] = useState<string>(
    initial?.detailImage && !initial.detailImage.startsWith("<") && initial.detailImage.startsWith("http") ? initial.detailImage : ""
  );
  const [detailHtml, setDetailHtml] = useState<string>(
    initial?.detailImage?.startsWith("<") ? initial.detailImage : ""
  );
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const detailTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (before: string, after = "") => {
    const el = detailTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = detailHtml.slice(start, end);
    const next = detailHtml.slice(0, start) + before + selected + after + detailHtml.slice(end);
    setDetailHtml(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const makeFileHandler = (setPreview: (v: string) => void) => (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleThumb = makeFileHandler(setThumbPreview);
  const handleDetail = makeFileHandler(setDetailPreview);

  const handleHtmlFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const sniff = new TextDecoder("latin1").decode(buffer.slice(0, 2000));
      const isEucKr = /charset=["']?euc-kr/i.test(sniff);
      const text = new TextDecoder(isEucKr ? "euc-kr" : "utf-8").decode(buffer);
      setDetailHtml(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let image = form.image;
      let detailImage = form.detailImage;
      if (thumbRef.current?.files?.[0]) {
        image = await uploadImage(thumbRef.current.files[0], "products");
      }
      if (detailMode === "upload") {
        if (detailRef.current?.files?.[0]) {
          detailImage = await uploadImage(detailRef.current.files[0], "products");
        }
      } else if (detailMode === "url") {
        detailImage = detailUrl.trim();
      } else {
        detailImage = detailHtml.trim();
      }
      const uploadedColorItems = await Promise.all(
        (form.colorItems ?? []).map(async (ci, i) => {
          const file = colorFiles[i];
          if (file) {
            const url = await uploadImage(file, "products");
            return { name: ci.name, image: url };
          }
          return ci;
        })
      );
      const periodPrices = form.periodPrices ?? [];
      const monthlyPrice = monthlyPriceFromCareItems(
        form.careServiceItems ?? [],
        periodPrices[0]?.price ?? form.monthlyPrice
      );
      await onSave({ ...form, image, detailImage, colorItems: uploadedColorItems, monthlyPrice });
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addPeriodPrice = () => set("periodPrices", [...(form.periodPrices ?? []), { label: "", price: 0 }]);
  const removePeriodPrice = (i: number) => set("periodPrices", (form.periodPrices ?? []).filter((_, j) => j !== i));
  const updatePeriodPrice = (i: number, field: keyof PeriodPrice, val: string | number) =>
    set("periodPrices", (form.periodPrices ?? []).map((pp, j) => j === i ? { ...pp, [field]: val } : pp));

  const addCareServiceItem = () => set("careServiceItems", [...(form.careServiceItems ?? []), { label: "", cycle: "" }]);
  const removeCareServiceItem = (i: number) => set("careServiceItems", (form.careServiceItems ?? []).filter((_, j) => j !== i));
  const updateCareServiceItem = (i: number, field: keyof CareServiceItem, val: string) =>
    set("careServiceItems", (form.careServiceItems ?? []).map((cs, j) => j === i ? { ...cs, [field]: val } : cs));

  const getMatrixPrice = (careIdx: number, periodLabel: string): number | "" => {
    const entry = (form.careServiceItems?.[careIdx]?.prices ?? []).find((p) => p.period === periodLabel);
    return entry ? entry.price : "";
  };
  const setMatrixPrice = (careIdx: number, periodLabel: string, val: string) => {
    const price = val === "" ? undefined : Number(val);
    set("careServiceItems", (form.careServiceItems ?? []).map((cs, j) => {
      if (j !== careIdx) return cs;
      const existing = cs.prices ?? [];
      const idx = existing.findIndex((p) => p.period === periodLabel);
      const prices =
        price === undefined
          ? existing.filter((p) => p.period !== periodLabel)
          : idx >= 0
            ? existing.map((p, k) => (k === idx ? { ...p, price } : p))
            : [...existing, { period: periodLabel, price }];
      return { ...cs, prices };
    }));
  };

  const addColorItem = () => {
    set("colorItems", [...(form.colorItems ?? []), { name: "", image: "" }]);
    setColorFiles((f) => [...f, null]);
    setColorPreviews((p) => [...p, ""]);
  };
  const removeColorItem = (i: number) => {
    set("colorItems", (form.colorItems ?? []).filter((_, j) => j !== i));
    setColorFiles((f) => f.filter((_, j) => j !== i));
    setColorPreviews((p) => p.filter((_, j) => j !== i));
  };
  const updateColorName = (i: number, name: string) =>
    set("colorItems", (form.colorItems ?? []).map((ci, j) => j === i ? { ...ci, name } : ci));
  const handleColorFile = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setColorPreviews((p) => p.map((v, j) => j === i ? url : v));
    };
    reader.readAsDataURL(file);
    setColorFiles((f) => f.map((v, j) => j === i ? file : v));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    set("tags", [...form.tags, { label: tagInput.trim(), type: tagType }]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">{initial ? "상품 수정" : "상품 추가"}</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-6 py-4 space-y-6">
          {/* 상위카테고리 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">상위카테고리</label>
            <select
              value={form.section}
              onChange={(e) => {
                const newSection = e.target.value;
                const cats = categoriesBySection[newSection] ?? [];
                setForm((f) => ({
                  ...f,
                  section: newSection,
                  category: cats.some((c) => c.name === f.category) ? f.category : (cats[0]?.name ?? ""),
                }));
              }}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
            >
              {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={`h-10 w-full rounded-xl border bg-white px-3 text-[13px] outline-none focus:border-[#c90f45] ${categoryMatched ? "border-[#e8e8e8]" : "border-[#f0b0b0]"}`}
            >
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              {!categoryMatched && (
                <option value={form.category}>{form.category ? `${form.category} (미등록)` : "카테고리 선택"}</option>
              )}
            </select>
          </div>

          {/* 상품명 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">상품명</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="상품명" />
          </div>

          {/* 모델번호 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">모델번호</label>
            <input value={form.model} onChange={(e) => set("model", e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="모델번호" />
          </div>

          {/* 가격 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">계약기간</label>
            <p className="mb-2 text-[11px] text-[#bbb]">
              {(form.careServiceItems?.length ?? 0) > 0
                ? "구독료는 아래 계약기간 × 케어서비스 표에서 입력합니다."
                : "구독료를 설정하려면 케어서비스를 1개 이상 추가하세요."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {(form.periodPrices ?? []).map((pp, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-[#fafafa] py-1 pl-3 pr-1.5">
                  <input
                    value={pp.label}
                    onChange={(e) => updatePeriodPrice(i, "label", e.target.value)}
                    className="h-7 w-16 bg-transparent text-[12px] outline-none"
                    placeholder="72개월"
                  />
                  <button type="button" onClick={() => removePeriodPrice(i)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eee] text-[10px] text-[#888] hover:bg-[#c90f45] hover:text-white">×</button>
                </div>
              ))}
              <button type="button" onClick={addPeriodPrice} className="flex h-8 items-center gap-1 rounded-full border-2 border-dashed border-[#e0e0e0] px-3 text-[12px] text-[#bbb] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors">
                + 기간 추가
              </button>
            </div>
          </div>

          {/* 케어서비스 주기 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">케어서비스 주기 <span className="font-normal text-[#aaa]">(선택)</span></label>
            <p className="mb-2 text-[11px] text-[#bbb]">케어서비스를 추가하면 아래에 계약기간별 구독료 표가 나타납니다.</p>
            <div className="space-y-2">
              {(form.careServiceItems ?? []).map((cs, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3 py-2">
                  <input
                    value={cs.label}
                    onChange={(e) => updateCareServiceItem(i, "label", e.target.value)}
                    className="h-8 w-24 shrink-0 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                    placeholder="라이트+"
                  />
                  <input
                    value={cs.cycle}
                    onChange={(e) => updateCareServiceItem(i, "cycle", e.target.value)}
                    className="h-8 flex-1 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                    placeholder="12개월에 1회"
                  />
                  <button type="button" onClick={() => removeCareServiceItem(i)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eee] text-[11px] text-[#888] hover:bg-[#c90f45] hover:text-white">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCareServiceItem} className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#e0e0e0] text-[12px] text-[#bbb] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors">
              + 케어서비스 추가
            </button>
          </div>

          {/* 구독료 매트릭스: 계약기간 × 케어서비스 */}
          {(form.periodPrices?.length ?? 0) > 0 && (form.careServiceItems?.length ?? 0) > 0 && (
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#555]">계약기간 × 케어서비스 구독료 (원)</label>
              <p className="mb-2 text-[11px] text-[#bbb]">비워두면 해당 조합은 상세페이지에서 &quot;상담 문의 시 안내&quot;로 표시됩니다.</p>
              <div className="overflow-x-auto rounded-xl border border-[#e8e8e8]">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-[#fafafa]">
                      <th className="sticky left-0 z-10 border-b border-r border-[#e8e8e8] bg-[#fafafa] px-3 py-2 text-left font-semibold text-[#555] whitespace-nowrap">계약기간</th>
                      {(form.careServiceItems ?? []).map((cs, ci) => (
                        <th key={ci} className="border-b border-[#e8e8e8] px-2 py-2 text-center font-semibold text-[#555] whitespace-nowrap">
                          {cs.label || `케어${ci + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(form.periodPrices ?? []).map((pp, pi) => (
                      <tr key={pi}>
                        <td className="sticky left-0 z-10 border-b border-r border-[#e8e8e8] bg-white px-3 py-1.5 font-medium text-[#555] whitespace-nowrap">
                          {pp.label || `기간${pi + 1}`}
                        </td>
                        {(form.careServiceItems ?? []).map((cs, ci) => (
                          <td key={ci} className="border-b border-[#e8e8e8] px-1.5 py-1.5">
                            <input
                              type="number"
                              value={getMatrixPrice(ci, pp.label)}
                              onChange={(e) => setMatrixPrice(ci, pp.label, e.target.value)}
                              className="h-8 w-full min-w-20 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                              placeholder="금액"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">최대혜택가 (원, 없으면 비워두기)</label>
            <input type="number" value={form.benefitPrice ?? ""} onChange={(e) => set("benefitPrice", e.target.value === "" ? null : Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="없음" />
          </div>

          {/* 색상 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">색상 옵션 <span className="font-normal text-[#aaa]">(선택)</span></label>
            <p className="mb-3 text-[11px] text-[#bbb]">색상별로 제품 이미지를 다르게 설정할 수 있습니다. 상세 페이지에서 색상 버튼 클릭 시 해당 이미지로 전환됩니다.</p>
            <div className="grid grid-cols-3 gap-3">
              {(form.colorItems ?? []).map((ci, i) => (
                <div key={i} className="relative rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-3">
                  <button
                    type="button"
                    onClick={() => removeColorItem(i)}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#eee] text-[11px] text-[#888] hover:bg-[#c90f45] hover:text-white"
                  >×</button>
                  <label htmlFor={`color-file-${i}`} className="block cursor-pointer">
                    <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
                      {colorPreviews[i] ? (
                        <Image src={colorPreviews[i]} alt="" fill className="object-contain" unoptimized />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-[#ccc]">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px]">이미지 추가</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`color-file-${i}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleColorFile(i, f); }}
                    />
                  </label>
                  <input
                    value={ci.name}
                    onChange={(e) => updateColorName(i, e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                    placeholder="색상명"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addColorItem}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#e0e0e0] text-[#bbb] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[11px] font-medium">색상 추가</span>
              </button>
            </div>
          </div>

          {/* 썸네일 이미지 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">썸네일 이미지 <span className="font-normal text-[#aaa]">(목록에 표시)</span></label>
            <p className="mb-1.5 text-[11px] text-[#bbb]">권장: 800 × 800px · 1:1 비율 · PNG/JPG · 1MB 이하</p>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumb(f); }} />
            <div
              onClick={() => thumbRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleThumb(f); }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors"
            >
              {thumbPreview ? (
                <div className="relative h-20 w-20">
                  <Image src={thumbPreview} alt="썸네일 미리보기" fill className="object-contain rounded-lg" unoptimized />
                </div>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              )}
              <p className="text-[12px] text-[#aaa]">{thumbPreview ? "클릭하여 변경" : "클릭하거나 드래그하여 첨부"}</p>
            </div>
            {thumbPreview && (
              <button type="button"
                onClick={() => { setThumbPreview(""); set("image", ""); if (thumbRef.current) thumbRef.current.value = ""; }}
                className="mt-1.5 text-[11px] text-[#bbb] hover:text-[#c90f45]">썸네일 삭제</button>
            )}
          </div>

          {/* 상세 이미지 */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-[#555]">상품 상세설명 <span className="font-normal text-[#aaa]">(상세 페이지에 표시)</span></label>
            {/* 모드 탭 */}
            <div className="mb-3 flex rounded-xl border border-[#e8e8e8] overflow-hidden">
              {([["upload", "파일 업로드"], ["url", "이미지 URL"], ["html", "HTML 작성"]] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDetailMode(mode)}
                  className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${
                    detailMode === mode
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-[#888] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {detailMode === mode && "✓ "}{label}
                </button>
              ))}
            </div>

            {/* 파일 업로드 */}
            {detailMode === "upload" && (
              <>
                <p className="mb-1.5 text-[11px] text-[#bbb]">권장: 1080 × 600px · 16:9 또는 가로형 · PNG/JPG · 2MB 이하</p>
                <input ref={detailRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDetail(f); }} />
                <div
                  onClick={() => detailRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleDetail(f); }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors"
                >
                  {detailPreview ? (
                    <div className="relative h-28 w-full max-w-xs">
                      <Image src={detailPreview} alt="상세 배너 미리보기" fill className="object-contain rounded-lg" unoptimized />
                    </div>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  )}
                  <p className="text-[12px] text-[#aaa]">{detailPreview ? "클릭하여 변경" : "클릭하거나 드래그하여 첨부"}</p>
                </div>
                {detailPreview && (
                  <button type="button"
                    onClick={() => { setDetailPreview(""); set("detailImage", ""); if (detailRef.current) detailRef.current.value = ""; }}
                    className="mt-1.5 text-[11px] text-[#bbb] hover:text-[#c90f45]">배너 삭제</button>
                )}
              </>
            )}

            {/* URL 입력 */}
            {detailMode === "url" && (
              <>
                <input
                  type="url"
                  value={detailUrl}
                  onChange={(e) => setDetailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
                />
                {detailUrl && (
                  <div className="relative mt-2 h-28 w-full overflow-hidden rounded-xl border border-[#f0f0f0]">
                    <Image src={detailUrl} alt="미리보기" fill className="object-contain" unoptimized />
                  </div>
                )}
              </>
            )}

            {/* HTML 작성 */}
            {detailMode === "html" && (
              <>
                <p className="mb-1.5 text-[11px] text-[#bbb]">Iframe, 팝업링크 제외. 이미지 URL은 https로 작성해주세요.</p>

                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1 text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors">
                    원본 .html 파일 불러오기 (인코딩 자동 감지)
                    <input
                      type="file"
                      accept=".html,.htm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHtmlFileUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-[#bbb]">EUC-KR로 저장된 원본 파일을 그대로 올리면 인코딩을 자동으로 맞춰줍니다.</p>
                </div>

                {/* 태그 빠른 삽입 툴바 */}
                <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-1.5">
                  {([
                    { label: "img",    before: '<img src="" alt="" style="max-width:100%;height:auto;display:block;" />', after: "" },
                    { label: "p",      before: "<p>", after: "</p>" },
                    { label: "h2",     before: "<h2>", after: "</h2>" },
                    { label: "h3",     before: "<h3>", after: "</h3>" },
                    { label: "div",    before: "<div>\n", after: "\n</div>" },
                    { label: "span",   before: "<span>", after: "</span>" },
                    { label: "strong", before: "<strong>", after: "</strong>" },
                    { label: "a",      before: '<a href="" target="_blank">', after: "</a>" },
                    { label: "br",     before: "<br />", after: "" },
                    { label: "hr",     before: '<hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />', after: "" },
                  ] as const).map(({ label, before, after }) => (
                    <button
                      key={label}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); insertTag(before, after); }}
                      className="rounded border border-[#e8e8e8] bg-white px-2 py-0.5 font-mono text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors"
                    >
                      {`<${label}>`}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={detailTextareaRef}
                  value={detailHtml}
                  onChange={(e) => setDetailHtml(e.target.value)}
                  placeholder={"<img src='https://...' />\n<div>...</div>"}
                  rows={8}
                  className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2.5 font-mono text-[12px] outline-none focus:border-[#c90f45] resize-y"
                  spellCheck={false}
                />
                {/charset=["']?EUC-KR/i.test(detailHtml) && (
                  <p className="mt-1 rounded-lg bg-[#fff8e1] px-3 py-2 text-[11px] text-[#b8860b]">
                    ⚠ EUC-KR 인코딩 HTML이 감지되었습니다. 지금처럼 텍스트를 복사해서 붙여넣으면 한글이 이미 깨진 상태로 들어올 수 있습니다.
                    위의 &quot;원본 .html 파일 불러오기&quot; 버튼으로 원본 파일을 직접 올려주세요. 이미 깨져서 붙여넣어진 글자(□, ?)는 복구할 수 없으니, 파일을 다시 올려 새로 반영해야 합니다.
                  </p>
                )}
                <div className="mt-1.5 flex justify-between">
                  <p className="text-[11px] text-[#bbb]">{detailHtml.length} 자</p>
                  {detailHtml && (
                    <button type="button" onClick={() => setDetailHtml("")} className="text-[11px] text-[#bbb] hover:text-[#c90f45]">초기화</button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 태그 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">태그</label>
            <div className="mb-2 flex flex-wrap gap-1">
              {form.tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[11px]">
                  {t.label}
                  <button type="button" onClick={() => set("tags", form.tags.filter((_, j) => j !== i))} className="text-[#999] hover:text-[#c90f45]">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={tagType} onChange={(e) => setTagType(e.target.value)}
                className="h-9 rounded-xl border border-[#e8e8e8] px-2 text-[12px] outline-none">
                <option value="naver">네이버페이</option>
                <option value="md">MD 추천</option>
                <option value="hot">HOT TREND</option>
                <option value="new">NEW</option>
                <option value="sale">판매</option>
              </select>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="h-9 flex-1 rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="태그 입력 후 Enter" />
              <button type="button" onClick={addTag} className="h-9 rounded-xl bg-[#f5f5f5] px-3 text-[12px] font-semibold hover:bg-[#eee]">추가</button>
            </div>
          </div>

          {/* 베스트 */}
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={form.isBest} onChange={(e) => set("isBest", e.target.checked)} className="accent-[#c90f45]" />
            <span className="text-[13px] font-semibold text-[#444]">베스트 상품 (캐러셀에 표시)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-6 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#555] hover:bg-[#f5f5f5]">취소</button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────── 카테고리 관리 ────── */
function CategoryManager({ section, categories, onChange }: {
  section: Section;
  categories: ManagedCategory[];
  onChange: (cats: ManagedCategory[]) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragFromId, setDragFromId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const add = () => {
    if (!newName.trim()) return;
    onChange([...categories, { id: `${section}_cat_${Date.now()}`, section, name: newName.trim(), order: categories.length }]);
    setNewName("");
  };

  const del = (id: string) => setConfirmId(id);

  const doCatDelete = () => {
    if (!confirmId) return;
    onChange(categories.filter((c) => c.id !== confirmId));
    setConfirmId(null);
  };

  const save = (id: string) => {
    onChange(categories.map((c) => c.id === id ? { ...c, name: editName } : c));
    setEditingId(null);
  };

  const handleDrop = (targetId: string) => {
    const fromId = dragId.current;
    dragId.current = null;
    setDragFromId(null);
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const fromIdx = sorted.findIndex((c) => c.id === fromId);
    const toIdx = sorted.findIndex((c) => c.id === targetId);
    const next = [...sorted];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    onChange(next.map((c, i) => ({ ...c, order: i })));
  };

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-6 rounded-2xl border border-[#f0f0f0] bg-white p-4">
      {confirmId && <ConfirmDialog message="이 카테고리를 삭제하면 해당 카테고리의 상품도 모두 삭제됩니다. 계속하시겠습니까?" onConfirm={doCatDelete} onCancel={() => setConfirmId(null)} />}
      <p className="mb-3 text-[13px] font-bold text-[#1a1a1a]">카테고리 관리</p>

      {/* 추가 폼 — 상단 */}
      <div className="mb-4 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-9 flex-1 rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="새 카테고리 이름" />
        <button type="button" onClick={add} className="h-9 rounded-xl bg-[#c90f45] px-4 text-[13px] font-bold text-white hover:opacity-90">추가</button>
      </div>

      <div className="space-y-1">
        {sorted.map((cat, idx) => {
          const fromIdx = dragFromId ? sorted.findIndex((c) => c.id === dragFromId) : -1;
          const isOver = dragOverId === cat.id && fromIdx !== -1 && fromIdx !== idx;
          const insertAbove = isOver && fromIdx > idx;
          const insertBelow = isOver && fromIdx < idx;
          return (
          <div key={cat.id}>
            {insertAbove && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
            <div
              draggable
              onDragStart={() => { dragId.current = cat.id; setDragFromId(cat.id); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(cat.id); }}
              onDrop={() => handleDrop(cat.id)}
              onDragEnd={() => { dragId.current = null; setDragFromId(null); setDragOverId(null); }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${
                dragFromId === cat.id ? "opacity-40" : "bg-[#fafafa]"
              }`}
            >
            <span className="cursor-grab text-[14px] text-[#ccc] active:cursor-grabbing">⠿</span>
            {editingId === cat.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save(cat.id)}
                  className="flex-1 rounded-lg border border-[#c90f45] px-2 py-1 text-[13px] outline-none" autoFocus />
                <button type="button" onClick={() => save(cat.id)} className="text-[12px] font-bold text-[#c90f45]">저장</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-[12px] text-[#999]">취소</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-[13px] text-[#333]">{cat.name}</span>
                <button type="button" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-[#aaa] hover:text-[#c90f45]" title="수정"><LuPencil size={13} /></button>
                <button type="button" onClick={() => del(cat.id)} className="text-[#ccc] hover:text-[#c90f45]" title="삭제"><LuTrash2 size={13} /></button>
              </>
            )}
            </div>
            {insertBelow && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
          </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────── 상위 카테고리(섹션) 관리 ────── */
function SectionManager({ sections, onChange }: {
  sections: ManagedSection[];
  onChange: (next: ManagedSection[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragFromId, setDragFromId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const add = () => {
    const label = newLabel.trim();
    const slug = newSlug.trim().toLowerCase();
    if (!label || !slug) { setError("표시 이름과 URL 슬러그를 모두 입력해주세요."); return; }
    if (!/^[a-z0-9-]{1,30}$/.test(slug)) { setError("URL 슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."); return; }
    if (sections.some((s) => s.id === slug)) { setError("이미 사용 중인 URL 슬러그입니다."); return; }
    setError("");
    onChange([...sections, { id: slug, label, order: sections.length }]);
    setNewLabel("");
    setNewSlug("");
  };

  const del = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await Promise.all([
      productStore.categories.setForSection(confirmId, []),
      productStore.products.setForSection(confirmId, []),
    ]);
    onChange(sections.filter((s) => s.id !== confirmId).map((s, i) => ({ ...s, order: i })));
    setConfirmId(null);
  };

  const save = (id: string) => {
    onChange(sections.map((s) => s.id === id ? { ...s, label: editLabel } : s));
    setEditingId(null);
  };

  const handleDrop = (targetId: string) => {
    const fromId = dragId.current;
    dragId.current = null;
    setDragFromId(null);
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const fromIdx = sorted.findIndex((s) => s.id === fromId);
    const toIdx = sorted.findIndex((s) => s.id === targetId);
    const next = [...sorted];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    onChange(next.map((s, i) => ({ ...s, order: i })));
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-6 rounded-2xl border border-[#f0f0f0] bg-white p-4">
      {confirmId && (
        <ConfirmDialog
          message="이 섹션을 삭제하면 관련 카테고리와 상품이 모두 삭제됩니다. 계속하시겠습니까?"
          onConfirm={doDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <p className="mb-3 text-[13px] font-bold text-[#1a1a1a]">상위 카테고리 관리</p>

      {/* 추가 폼 */}
      <div className="mb-2 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="h-9 flex-1 rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          placeholder="표시 이름 (예: 정수기)"
        />
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-9 w-40 rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          placeholder="URL 슬러그 (예: water)"
        />
        <button type="button" onClick={add} className="h-9 shrink-0 rounded-xl bg-[#c90f45] px-4 text-[13px] font-bold text-white hover:opacity-90">추가</button>
      </div>
      {error && <p className="mb-3 text-[12px] text-[#c90f45]">{error}</p>}

      <div className="space-y-1">
        {sorted.map((sec, idx) => {
          const fromIdx = dragFromId ? sorted.findIndex((s) => s.id === dragFromId) : -1;
          const isOver = dragOverId === sec.id && fromIdx !== -1 && fromIdx !== idx;
          const insertAbove = isOver && fromIdx > idx;
          const insertBelow = isOver && fromIdx < idx;
          return (
            <div key={sec.id}>
              {insertAbove && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
              <div
                draggable
                onDragStart={() => { dragId.current = sec.id; setDragFromId(sec.id); }}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(sec.id); }}
                onDrop={() => handleDrop(sec.id)}
                onDragEnd={() => { dragId.current = null; setDragFromId(null); setDragOverId(null); }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${
                  dragFromId === sec.id ? "opacity-40" : "bg-[#fafafa]"
                }`}
              >
                <span className="cursor-grab text-[14px] text-[#ccc] active:cursor-grabbing">⠿</span>
                {editingId === sec.id ? (
                  <>
                    <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && save(sec.id)}
                      className="flex-1 rounded-lg border border-[#c90f45] px-2 py-1 text-[13px] outline-none" autoFocus />
                    <button type="button" onClick={() => save(sec.id)} className="text-[12px] font-bold text-[#c90f45]">저장</button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-[12px] text-[#999]">취소</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-[13px] text-[#333]">{sec.label}</span>
                    <span className="text-[11px] text-[#bbb]">/products/{sec.id}</span>
                    <button type="button" onClick={() => { setEditingId(sec.id); setEditLabel(sec.label); }} className="text-[#aaa] hover:text-[#c90f45]" title="수정"><LuPencil size={13} /></button>
                    <button type="button" onClick={() => del(sec.id)} className="text-[#ccc] hover:text-[#c90f45]" title="삭제"><LuTrash2 size={13} /></button>
                  </>
                )}
              </div>
              {insertBelow && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────── 엑셀 템플릿 다운로드 ────── */
const TEMPLATE_CARE_GROUP_COUNT = 2;

async function downloadExcelTemplate(sections: ManagedSection[]) {
  const XLSX = await import("xlsx");
  const baseHeaders = [
    "상위카테고리", "카테고리", "상품명", "모델번호",
    "최대혜택가", "색상(콤마로 구분)", "베스트상품(Y/N)", "태그(라벨:타입,라벨2:타입2)",
  ];
  const headers = [...baseHeaders, ...careGroupHeaders(TEMPLATE_CARE_GROUP_COUNT)];
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const sectionLabel = (i: number) => sorted[i % sorted.length]?.label ?? "";
  const examples = [
    [sectionLabel(0), "정수기", "예시 상품명", "ABCD-1234", "", "네이처 그린", "N", "네이버페이:naver",
      "라이트+", "12개월", 39900, 43900, 47900, "프리미엄", "12개월", 56900, 63900, 74900],
    [sectionLabel(1), "안마의자", "예시 상품명2", "EFGH-5678", "", "", "N", "",
      "케어", "12개월", 43900, 47900, "", "", "", "", "", ""],
    [sectionLabel(2), "스타일러", "예시 상품명3", "IJKL-9012", "", "", "Y", "MD 추천:md",
      "", "", "", "", "", "", "", "", "", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "상품등록");
  XLSX.writeFile(wb, "상품_업로드_템플릿.xlsx");
}

/* ────── 등록된 상품 엑셀 다운로드 ────── */
async function downloadProductsExcel(products: ManagedProduct[], sections: ManagedSection[]) {
  const XLSX = await import("xlsx");
  const baseHeaders = [
    "상위카테고리", "카테고리", "상품명", "모델번호",
    "최대혜택가", "색상(콤마로 구분)", "베스트상품(Y/N)", "태그(라벨:타입,라벨2:타입2)",
  ];
  const careGroupCount = Math.max(1, ...products.map((p) => careItemsForExport(p).length));
  const headers = [...baseHeaders, ...careGroupHeaders(careGroupCount)];
  const sectionLabel = (id: string) => sections.find((s) => s.id === id)?.label ?? id;
  const rows = products.map((p) => {
    const careItems = careItemsForExport(p);
    const colorNames = legacyColorItems(p).map((c) => c.name).filter(Boolean).join(",");
    const careCells = Array.from({ length: careGroupCount }, (_, i) => {
      const cs = careItems[i];
      return [
        cs?.label ?? "", cs?.cycle ?? "",
        ...CARE_GROUP_PERIODS.map((period) => periodPriceFor(cs, period.replace("개월", ""))),
      ];
    }).flat();
    return [
      sectionLabel(p.section), p.category, p.name, p.model,
      p.benefitPrice ?? "", colorNames, p.isBest ? "Y" : "N",
      p.tags.map((t) => `${t.label}:${t.type}`).join(","),
      ...careCells,
    ];
  });
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "상품목록");
  XLSX.writeFile(wb, "상품_목록.xlsx");
}

/* ────── 엑셀 업로드 모달 ────── */
function ExcelUploadModal({
  sections,
  defaultSection,
  onImport,
  onClose,
}: {
  sections: ManagedSection[];
  defaultSection: Section;
  onImport: (products: Omit<ManagedProduct, "id" | "order">[]) => void;
  onClose: () => void;
}) {
  const [parsed, setParsed] = useState<Omit<ManagedProduct, "id" | "order">[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [categoriesBySection, setCategoriesBySection] = useState<Record<string, ManagedCategory[]>>({});
  const [liveSections, setLiveSections] = useState<ManagedSection[]>(sections);
  const [existingProducts, setExistingProducts] = useState<ManagedProduct[]>([]);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 모달을 열 때마다 최신 상위카테고리·카테고리 목록을 다시 받아온다.
  // 부모의 sections는 admin 페이지 최초 진입 시 한 번만 불러온 값이라 오래 켜둔 탭에서는 오래된 값일 수 있다.
  useEffect(() => {
    productStore.sections.get().then((secs) => {
      setLiveSections(secs);
      // 섹션별로 개별 조회해야 한다: 전체 한 번에 조회하면 DB에 카테고리가 하나라도 있는 순간
      // (예: 주방가전만 등록됨) 나머지 빈 섹션은 기본 카테고리로 대체되지 않고 그냥 빈 목록이 된다.
      Promise.all(secs.map((s) => productStore.categories.getBySection(s.id))).then((results) => {
        const map: Record<string, ManagedCategory[]> = {};
        secs.forEach((s, i) => {
          map[s.id] = [...results[i]].sort((a, b) => a.order - b.order);
        });
        setCategoriesBySection(map);
      });
      // 덮어쓰기 판정(미리보기 배지·확인 문구용)을 위해 등록된 상품도 함께 받아온다.
      // (숨김 처리된 상품도 판정 대상에 포함해야 재업로드 시 중복 등록되지 않는다.)
      Promise.all(secs.map((s) => productStore.products.getBySection(s.id, { includeHidden: true }))).then((results) => {
        setExistingProducts(results.flat());
      });
    });
  }, []);

  const duplicateCount = parsed.filter((p) => existingProducts.some((e) => isSameProduct(e, p))).length;

  const normalize = (s: string) => s.trim().replace(/\s+/g, "").toLowerCase();

  // "상위카테고리" 셀 텍스트를 실제 등록된 섹션과 매칭. 못 찾으면 null.
  const matchSectionByText = (text: string): Section | null => {
    const norm = normalize(text);
    if (!norm) return null;
    const match = liveSections.find((s) => normalize(s.label) === norm || normalize(s.id) === norm);
    return match ? match.id : null;
  };

  // "카테고리"(하위카테고리) 셀 텍스트가 어느 섹션에 등록된 이름인지 역으로 찾는다. 못 찾으면 null.
  const matchSectionByCategory = (categoryText: string): Section | null => {
    const norm = normalize(categoryText);
    if (!norm) return null;
    const found = liveSections.find((s) => (categoriesBySection[s.id] ?? []).some((c) => normalize(c.name) === norm));
    return found ? found.id : null;
  };

  // "카테고리" 칸에 실제로는 상위카테고리 이름(예: "TV")이 적힌 경우를 가려낸다.
  // 이때는 그 이름으로 상위카테고리를 잡고, 하위카테고리는 비워서 미리보기에서 직접 고르도록 안내한다.
  const resolveSectionAndCategory = (sectionText: string, categoryText: string): { section: Section; category: string | null } => {
    const bySectionColumn = matchSectionByText(sectionText);
    if (bySectionColumn) return { section: bySectionColumn, category: null };

    const categoryLooksLikeSection = matchSectionByText(categoryText);
    if (categoryLooksLikeSection) return { section: categoryLooksLikeSection, category: "" };

    const byCategoryLookup = matchSectionByCategory(categoryText);
    if (byCategoryLookup) return { section: byCategoryLookup, category: null };

    return { section: defaultSection, category: null };
  };

  const handleFile = async (file: File) => {
    setError("");
    setParsed([]);
    setFileName(file.name);
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];

      // 케어서비스 그룹마다 "72개월/60개월/48개월" 헤더가 똑같이 반복되므로(이름 중복),
      // 이름 기반 객체 파싱(sheet_to_json 기본 모드)으로는 뒤 그룹 값이 앞 그룹 값을 덮어써 버린다.
      // 그래서 행을 배열째로 읽어 헤더 위치(인덱스) 기준으로 값을 꺼낸다.
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
      const headerRow = (aoa[0] ?? []) as string[];
      const dataRows = aoa.slice(1);
      const colIndex = (colName: string) => headerRow.indexOf(colName);

      let careGroupCount = 0;
      while (headerRow.includes(`케어서비스${careGroupCount + 1}_라벨`)) careGroupCount++;

      const results: Omit<ManagedProduct, "id" | "order">[] = [];
      const errors: string[] = [];

      dataRows.forEach((cells, i) => {
        const rowNum = i + 2;
        const cell = (colName: string) => cells[colIndex(colName)];
        const name = String(cell("상품명") ?? "").trim();
        if (!name) { errors.push(`${rowNum}행: 상품명 필수`); return; }

        const rawCategory = String(cell("카테고리") ?? "").trim();
        const { section, category: forcedCategory } = resolveSectionAndCategory(String(cell("상위카테고리") ?? ""), rawCategory);
        const sectionCats = categoriesBySection[section] ?? [];
        // 빈 셀만 해당 섹션의 첫 카테고리로 채우고, 값이 있으면 등록 여부와 상관없이 엑셀에 적힌 그대로 유지한다.
        // (미등록 값이면 미리보기에서 "(미등록)"으로 표시되고 드롭다운으로 직접 고를 수 있다.)
        // "카테고리" 칸이 상위카테고리 이름이었던 경우(forcedCategory === "")엔 비워서 직접 선택하도록 안내한다.
        const category = forcedCategory !== null ? forcedCategory : (rawCategory || (sectionCats[0]?.name ?? ""));

        const tagsRaw = String(cell("태그(라벨:타입,라벨2:타입2)") ?? "").trim();
        const tags = tagsRaw
          ? tagsRaw.split(",").map((t) => {
              const [label, type] = t.split(":").map((s) => s.trim());
              return { label: label ?? t.trim(), type: type ?? "naver" };
            }).filter((t) => t.label)
          : [];

        // 케어서비스N_라벨 컬럼 위치를 기준으로 바로 다음 칸들(주기, 72개월, 60개월, 48개월)을
        // 순서대로 읽어 careServiceItems 매트릭스로 되돌린다.
        const careServiceItems = Array.from({ length: careGroupCount }, (_, gi) => {
          const labelIdx = colIndex(`케어서비스${gi + 1}_라벨`);
          const label = String(cells[labelIdx] ?? "").trim();
          const cycle = String(cells[labelIdx + 1] ?? "").trim();
          const prices = CARE_GROUP_PERIODS.map((period, pi) => {
            const v = cells[labelIdx + 2 + pi];
            return v !== undefined && v !== "" ? { period, price: Number(v) || 0 } : null;
          }).filter((pp): pp is { period: string; price: number } => pp !== null);
          return { label, cycle, prices };
        }).filter((cs) => cs.label || cs.cycle || cs.prices.length > 0);

        // 계약기간 목록은 72/60/48개월 중 실제로 가격이 입력된 것만, 고정 순서대로 모은다.
        const periodPrices = CARE_GROUP_PERIODS
          .filter((period) => careServiceItems.some((cs) => cs.prices.some((pp) => pp.period === period)))
          .map((label) => ({ label, price: 0 }));

        const monthlyPrice = monthlyPriceFromCareItems(careServiceItems, 0);

        const colorNamesRaw = String(cell("색상(콤마로 구분)") ?? cell("색상") ?? "").trim();
        const colorItems = colorNamesRaw
          ? colorNamesRaw.split(",").map((n) => n.trim()).filter(Boolean).map((n) => ({ name: n, image: "" }))
          : [];

        const benefitPriceCell = cell("최대혜택가");
        results.push({
          section,
          category,
          name,
          model: String(cell("모델번호") ?? "").trim(),
          monthlyPrice,
          periodPrices,
          careServiceItems,
          colorItems,
          benefitPrice: benefitPriceCell !== undefined && benefitPriceCell !== "" ? Number(benefitPriceCell) : null,
          tags,
          image: "",
          detailImage: "",
          isBest: String(cell("베스트상품(Y/N)") ?? "").trim().toUpperCase() === "Y",
        });
      });

      if (errors.length > 0) setError(errors.join(" / "));
      setParsed(results);
    } catch {
      setError("파일을 읽을 수 없습니다. xlsx 형식인지 확인해주세요.");
    }
  };

  const updateCategory = (i: number, category: string) =>
    setParsed((prev) => prev.map((p, j) => (j === i ? { ...p, category } : p)));

  const updateSection = (i: number, section: Section) => {
    const cats = categoriesBySection[section] ?? [];
    setParsed((prev) => prev.map((p, j) => {
      if (j !== i) return p;
      const category = cats.some((c) => c.name === p.category) ? p.category : (cats[0]?.name ?? "");
      return { ...p, section, category };
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">엑셀로 상품 일괄 등록</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* 안내 */}
          <div className="rounded-xl bg-[#fafafa] border border-[#f0f0f0] px-4 py-3 text-[12px] text-[#666] leading-[1.8]">
            <p className="font-semibold text-[#333] mb-1">안내사항</p>
            <p>· 같은 상위카테고리에 모델번호가 일치하는 상품이 이미 등록되어 있으면 자동으로 덮어씁니다 (모델번호가 없으면 카테고리+상품명으로 판단).</p>
            <p>· 이미지는 엑셀로 등록할 수 없어 신규 상품은 개별 상품 수정에서 직접 추가해야 하며, 이미 등록된 상품을 덮어쓸 때는 기존 썸네일·상세이미지·색상별 이미지가 그대로 유지됩니다.</p>
            <p>· 상위카테고리를 비워두면 <strong className="text-[#c90f45]">{liveSections.find((s) => s.id === defaultSection)?.label ?? defaultSection}</strong> 에 등록됩니다.</p>
            <p>· 상위카테고리·카테고리명이 등록된 값과 다르면 원본 텍스트가 그대로 유지되고 빨간 테두리로 표시되니, 업로드 후 미리보기에서 드롭다운으로 직접 선택해 수정해 주세요.</p>
            <p>· 케어서비스별 구독료는 각 케어서비스 라벨·주기 바로 뒤 <strong className="text-[#c90f45]">72개월 / 60개월 / 48개월</strong> 칸에 순서대로 숫자만 입력하세요 (컬럼명은 케어서비스마다 동일하게 반복되지만 위치로 구분됩니다). 비워두면 상세페이지에 &quot;상담 문의 시 안내&quot;로 표시됩니다.</p>
            <p>· 색상은 <strong className="text-[#c90f45]">콤마로 구분</strong>해 이름만 입력하세요 (색상별 이미지는 업로드 후 개별 상품 수정에서 추가). 덮어쓰기 시 이 칸을 비워두면 기존 색상 목록이 그대로 유지됩니다.</p>
          </div>

          {/* 템플릿 다운로드 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadExcelTemplate(liveSections)}
              className="flex items-center gap-1.5 h-9 rounded-xl border border-[#e8e8e8] px-4 text-[13px] text-[#555] hover:border-[#555] transition-colors"
            >
              ↓ 템플릿 다운로드
            </button>
            <span className="text-[12px] text-[#aaa]">템플릿을 다운받아 작성 후 업로드하세요.</span>
          </div>

          {/* 파일 업로드 영역 */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-6 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors"
            >
              <p className="text-[13px] font-semibold text-[#555]">{fileName || "클릭하거나 드래그하여 엑셀 파일 첨부"}</p>
              <p className="text-[11px] text-[#aaa]">.xlsx, .xls 파일 지원</p>
            </div>
          </div>

          {/* 오류 */}
          {error && (
            <p className="rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] text-[#c90f45]">⚠ {error}</p>
          )}

          {/* 미리보기 */}
          {parsed.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[#333]">미리보기 ({parsed.length}개 상품) — 상위카테고리·카테고리는 클릭해서 바로 수정할 수 있습니다.</p>
              <div className="overflow-x-auto rounded-xl border border-[#f0f0f0]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                      <th className="w-28 px-3 py-2 text-left font-semibold text-[#555]">상위카테고리</th>
                      <th className="w-28 px-3 py-2 text-left font-semibold text-[#555]">카테고리</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#555]">상품명</th>
                      <th className="w-24 px-3 py-2 text-left font-semibold text-[#555]">모델번호</th>
                      <th className="w-20 px-3 py-2 text-left font-semibold text-[#555] whitespace-nowrap">등록 결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((p, i) => {
                      const cats = categoriesBySection[p.section] ?? [];
                      const categoryMatched = cats.some((c) => c.name === p.category);
                      const isDuplicate = existingProducts.some((e) => isSameProduct(e, p));
                      return (
                      <tr key={i} className="border-b border-[#f0f0f0] last:border-0">
                        <td className="px-3 py-2">
                          <select
                            value={p.section}
                            onChange={(e) => updateSection(i, e.target.value)}
                            className="h-8 w-28 shrink-0 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                          >
                            {liveSections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={p.category}
                            onChange={(e) => updateCategory(i, e.target.value)}
                            className={`h-8 w-28 shrink-0 rounded-lg border bg-white px-2 text-[12px] outline-none focus:border-[#c90f45] ${categoryMatched ? "border-[#e8e8e8]" : "border-[#f0b0b0]"}`}
                          >
                            {cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            {/* 등록된 목록에 없는 값(빈 값 포함)도 항상 최소 1개 옵션을 보여줘 드롭다운이 비지 않게 한다 */}
                            {!categoryMatched && (
                              <option value={p.category}>{p.category ? `${p.category} (미등록)` : "카테고리 선택"}</option>
                            )}
                          </select>
                        </td>
                        <td className="max-w-40 truncate px-3 py-2 font-semibold text-[#1a1a1a]" title={p.name}>{p.name}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-[#888]">{p.model || "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {isDuplicate ? (
                            <span className="rounded-full bg-[#fff0f4] px-2 py-0.5 text-[11px] font-semibold text-[#c90f45]">덮어씀</span>
                          ) : (
                            <span className="rounded-full bg-[#f0f8f2] px-2 py-0.5 text-[11px] font-semibold text-[#2f9e5c]">신규</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-6 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#555] hover:bg-[#f5f5f5]">취소</button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={parsed.length === 0}
            className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-40"
          >
            {parsed.length > 0 ? `${parsed.length}개 상품 가져오기` : "가져오기"}
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="엑셀 업로드 확인"
          message={
            duplicateCount > 0
              ? `${parsed.length}개 중 ${duplicateCount}개는 이미 등록된 상품이라 덮어쓰고, 나머지 ${parsed.length - duplicateCount}개는 신규로 등록됩니다. 진행할까요?`
              : `${parsed.length}개 상품을 모두 신규로 등록합니다. 진행할까요?`
          }
          onConfirm={() => { setConfirming(false); onImport(parsed); onClose(); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

/* ────── 상품 행 ────── */
function ProductRow({ product, onEdit, onDelete, onToggleVisibility, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, showSection, sectionLabel, imgRetryKey, selected, onToggleSelect }: {
  product: ManagedProduct;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isDragging: boolean;
  showSection?: boolean;
  sectionLabel?: (id: string) => string;
  imgRetryKey?: number;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  // 이미지 URL이 바뀌었거나(새 이미지 등록) 새로고침 버튼으로 재시도를 요청했을 때
  // 예전 로딩 실패 상태를 지우고 다시 시도한다. (전체 페이지 새로고침 없이도 복구되게)
  useEffect(() => { setImgError(false); }, [product.image, imgRetryKey]);
  const isVisible = product.isVisible !== false;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-white px-4 py-3 transition-all ${
        isDragging ? "opacity-40" : ""
      } ${!isVisible ? "opacity-50" : ""}`}
    >
      {/* 드래그 핸들 */}
      <span className="cursor-grab text-[16px] text-[#ccc] active:cursor-grabbing shrink-0">⠿</span>

      {/* 선택 체크박스 */}
      <input
        type="checkbox"
        checked={selected ?? false}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 shrink-0 accent-[#c90f45]"
      />

      {/* 이미지 */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
        {product.image && !imgError ? (
          <Image src={product.image} alt="" fill className="object-contain" onError={() => setImgError(true)} unoptimized />
        ) : (
          <span className="flex h-full items-center justify-center text-[9px] text-[#ccc]">없음</span>
        )}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#1a1a1a]">{product.name}</p>
        <p className="text-[11px] text-[#999]">
          {showSection && <span className="mr-1 rounded bg-[#f0f0f0] px-1.5 py-0.5 text-[10px] font-semibold text-[#666]">{sectionLabel?.(product.section) ?? product.section}</span>}
          {product.model} · {product.category}
        </p>
        <p className="text-[12px] font-bold text-[#c90f45]">
          월 {monthlyPriceFromCareItems(legacyCareServiceItems(product), product.monthlyPrice).toLocaleString()}원
        </p>
      </div>

      {/* 베스트 뱃지 */}
      {product.isBest && (
        <span className="shrink-0 rounded-full bg-[#fff0f4] px-2 py-0.5 text-[10px] font-bold text-[#c90f45]">베스트</span>
      )}

      {/* 노출 상태 뱃지 */}
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isVisible ? "bg-[#f0f8f2] text-[#2f9e5c]" : "bg-[#f5f5f5] text-[#999]"}`}>
        {isVisible ? "노출중" : "숨김"}
      </span>

      {/* 액션 */}
      <div className="flex shrink-0 gap-2">
        <a
          href={`/products/${product.section}/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]"
          title="자사몰 상세페이지 바로가기"
        >
          <LuExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={onToggleVisibility}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isVisible ? "border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]" : "border-[#e8e8e8] text-[#bbb] hover:border-[#c90f45] hover:text-[#c90f45]"}`}
          title={isVisible ? "노출 끄기" : "노출 켜기"}
        >
          {isVisible ? <LuEye size={14} /> : <LuEyeOff size={14} />}
        </button>
        <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]" title="수정"><LuPencil size={14} /></button>
        <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#999] hover:border-[#c90f45] hover:text-[#c90f45]" title="삭제"><LuTrash2 size={14} /></button>
      </div>
    </div>
  );
}

/* ────── 메인 ────── */
export default function ProductAdmin({ defaultSubTab = "products" }: { defaultSubTab?: "category" | "products" }) {
  const [subTab, setSubTab] = useState<"category" | "products">(defaultSubTab);
  const [sectionFilter, setSectionFilter] = useState<"all" | Section>(defaultSubTab === "category" ? "kitchen" : "all");
  const [section, setSection] = useState<Section>("kitchen");
  const [products, setProductsState] = useState<ManagedProduct[]>([]);
  const [categories, setCategoriesState] = useState<ManagedCategory[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: ManagedProduct | null }>({ open: false, editing: null });
  const [excelModal, setExcelModal] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("전체");
  const [search, setSearch] = useState("");
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragFromProductId, setDragFromProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const dragProductId = useRef<string | null>(null);
  const [sections, setSections] = useState<ManagedSection[]>([]);
  // 썸네일 로드가 실패했던 상품도 새로고침 버튼을 누르면 다시 시도하도록, 클릭할 때마다 값을 바꿔서
  // ProductRow에 내려준다 (이미지 URL 자체는 안 바뀌어도 다시 시도해볼 필요가 있는 경우가 있음).
  const [imgRetryKey, setImgRetryKey] = useState(0);

  useEffect(() => { productStore.sections.get().then(setSections); }, []);

  const sectionLabel = (id: string) => sections.find((s) => s.id === id)?.label ?? id;

  const saveSections = (next: ManagedSection[]) => {
    setSections([...next].sort((a, b) => a.order - b.order));
    productStore.sections.setAll(next);
    if (sectionFilter !== "all" && !next.some((s) => s.id === sectionFilter)) {
      setSectionFilter(next[0]?.id ?? "kitchen");
    }
  };

  const reload = () => {
    setImgRetryKey((k) => k + 1);
    if (sectionFilter === "all") {
      // "전체" 탭에서는 상품 추가 모달이 사용할 section 기준으로 카테고리를 로드해야
      // 카테고리 select가 비어있지 않다.
      return Promise.all([
        Promise.all(sections.map((s) => productStore.products.getBySection(s.id, { includeHidden: true }))),
        productStore.categories.getBySection(section),
      ]).then(([allProds, cats]) => {
        setProductsState(allProds.flat().sort((a, b) => a.order - b.order));
        setCategoriesState(cats);
      });
    }
    return Promise.all([
      productStore.products.getBySection(sectionFilter, { includeHidden: true }),
      productStore.categories.getBySection(sectionFilter),
    ]).then(([prods, cats]) => {
      setProductsState(prods);
      setCategoriesState(cats);
    });
  };

  useEffect(() => {
    if (sectionFilter !== "all") setSection(sectionFilter);
    setLoading(true);
    setSelectedIds(new Set());
    reload().then(() => { setFilterCat("전체"); setSearch(""); setLoading(false); });
  }, [sectionFilter, sections, section]);

  /* 카테고리 저장 */
  const saveCategories = (next: ManagedCategory[]) => {
    setCategoriesState([...next].sort((a, b) => a.order - b.order));
    productStore.categories.setForSection(section, next);
  };

  /* 상품 저장 — 실제 section 값 기준으로 그룹핑해서 저장 (전체 탭에서 섹션이 섞이는 것 방지) */
  const persistProducts = (next: ManagedProduct[]) => {
    setProductsState([...next].sort((a, b) => a.order - b.order));
    const bySection = new Map<Section, ManagedProduct[]>();
    next.forEach((p) => {
      if (!bySection.has(p.section)) bySection.set(p.section, []);
      bySection.get(p.section)!.push(p);
    });
    return Promise.all(
      Array.from(bySection.entries()).map(([sec, items]) =>
        productStore.products.setForSection(sec, items.map((p, i) => ({ ...p, order: i })))
      )
    );
  };

  const saveProducts = (next: ManagedProduct[]) => {
    persistProducts(next);
  };

  const addOrEdit = async (form: Omit<ManagedProduct, "id" | "order">) => {
    let next: ManagedProduct[];
    if (modal.editing) {
      next = products.map((p) => p.id === modal.editing!.id ? { ...p, ...form } : p);
    } else {
      const maxOrder = products.length ? Math.max(...products.map((p) => p.order)) + 1 : 0;
      next = [...products, { ...form, id: `${form.section}_${Date.now()}`, order: maxOrder }];
    }
    setModal({ open: false, editing: null });
    await persistProducts(next);
    reload();
  };

  const importFromExcel = async (newProducts: Omit<ManagedProduct, "id" | "order">[]) => {
    // 현재 화면에 로드된 products는 sectionFilter에 따라 일부 섹션만 포함할 수 있으므로,
    // 덮어쓰기 판정과 저장은 전체 섹션의 최신 데이터를 기준으로 한다.
    const allExisting = (
      await Promise.all(sections.map((s) => productStore.products.getBySection(s.id, { includeHidden: true })))
    ).flat();
    const nextOrderBySection = new Map<Section, number>();
    sections.forEach((s) => {
      const items = allExisting.filter((p) => p.section === s.id);
      nextOrderBySection.set(s.id, items.length ? Math.max(...items.map((p) => p.order)) + 1 : 0);
    });

    const merged = [...allExisting];
    newProducts.forEach((p, i) => {
      const matchIdx = merged.findIndex((existing) => isSameProduct(existing, p));
      if (matchIdx >= 0) {
        // 엑셀에는 이미지 정보가 없으므로(항상 image: "" 로 파싱됨) 덮어쓸 때 기존 썸네일/상세이미지/색상별
        // 이미지를 그대로 유지한다. 안 그러면 재업로드할 때마다 등록해둔 이미지가 전부 사라진다.
        const existing = merged[matchIdx];
        merged[matchIdx] = {
          ...p,
          id: existing.id,
          order: existing.order,
          image: existing.image,
          detailImage: existing.detailImage,
          // 엑셀 양식엔 컬럼이 없어서 애초에 실어 나를 수 없는 구버전 필드들. 그대로 두면 매번
          // undefined로 덮어써져서 이 필드에만 의존하던(아직 새 배열 필드로 안 옮겨진) 상품의
          // 계약기간·케어서비스·색상 정보가 조용히 사라진다. 기존 값을 그대로 유지한다.
          price60: existing.price60,
          price48: existing.price48,
          price36: existing.price36,
          careService: existing.careService,
          manageCycle: existing.manageCycle,
          color: existing.color,
          size: existing.size,
          // 엑셀의 "색상" 칸이 비어있으면(색상은 안 건드리고 다른 값만 고치려던 경우 포함) 기존 색상
          // 목록을 그대로 유지한다. 값이 있으면 이름이 같은 색상은 기존 이미지를 유지한 채 갱신한다.
          colorItems: p.colorItems && p.colorItems.length > 0
            ? p.colorItems.map((ci) => {
                const matchedColor = (existing.colorItems ?? []).find((ec) => ec.name === ci.name);
                return matchedColor ? { ...ci, image: matchedColor.image } : ci;
              })
            : (existing.colorItems ?? []),
        };
      } else {
        const order = nextOrderBySection.get(p.section) ?? 0;
        nextOrderBySection.set(p.section, order + 1);
        merged.push({ ...p, id: `${p.section}_excel_${Date.now()}_${i}`, order });
      }
    });

    await persistProducts(merged);
    reload();
  };

  const deleteProduct = (id: string) => setConfirmProductId(id);

  // 노출 on/off는 products 테이블을 건드리지 않고 별도로 저장되므로, 목록을 다시 불러오지 않고
  // 화면 상태만 낙관적으로 갱신한다 (꺼도 상품 데이터는 그대로 남아 있음).
  const toggleVisibility = async (product: ManagedProduct) => {
    const nextVisible = !(product.isVisible !== false);
    setProductsState((prev) => prev.map((p) => (p.id === product.id ? { ...p, isVisible: nextVisible } : p)));
    try {
      await productStore.products.setVisibility(product.id, nextVisible);
    } catch {
      setProductsState((prev) => prev.map((p) => (p.id === product.id ? { ...p, isVisible: !nextVisible } : p)));
    }
  };

  // 선택한 상품들을 한 번에 노출 on/off. 개별 setVisibility를 병렬로 여러 번 호출하면
  // 서버에서 같은 설정 행을 각자 읽고 덮어써 마지막 요청만 반영되는 문제가 있었어서,
  // 반드시 setVisibilityBulk로 한 번에 묶어 보낸다. 실패 시 전체 롤백한다.
  const bulkSetVisibility = async (ids: Set<string>, nextVisible: boolean) => {
    const targetIds = products.filter((p) => ids.has(p.id) && (p.isVisible !== false) !== nextVisible).map((p) => p.id);
    if (targetIds.length === 0) return;
    setProductsState((prev) => prev.map((p) => (targetIds.includes(p.id) ? { ...p, isVisible: nextVisible } : p)));
    try {
      await productStore.products.setVisibilityBulk(targetIds, nextVisible);
    } catch {
      setProductsState((prev) => prev.map((p) => (targetIds.includes(p.id) ? { ...p, isVisible: !nextVisible } : p)));
    }
  };

  const handleProductDrop = (targetId: string) => {
    const fromId = dragProductId.current;
    dragProductId.current = null;
    setDragFromProductId(null);
    setDragOverProductId(null);
    if (!fromId || fromId === targetId) return;
    const sorted = [...products].sort((a, b) => a.order - b.order);
    const fromIdx = sorted.findIndex((p) => p.id === fromId);
    const toIdx = sorted.findIndex((p) => p.id === targetId);
    const next = [...sorted];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    saveProducts(next.map((p, i) => ({ ...p, order: i })));
  };

  const doDeleteProduct = () => {
    if (!confirmProductId) return;
    const next = products.filter((p) => p.id !== confirmProductId).map((p, i) => ({ ...p, order: i }));
    saveProducts(next);
    setConfirmProductId(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...products].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const next = sorted.map((p, i) => {
      if (i === idx) return { ...p, order: sorted[swapIdx].order };
      if (i === swapIdx) return { ...p, order: sorted[idx].order };
      return p;
    });
    saveProducts(next);
  };

  const filteredProducts = products
    .filter((p) => filterCat === "전체" || p.category === filterCat)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (filteredProducts.length > 0 && filteredProducts.every((p) => prev.has(p.id))) return new Set();
      return new Set(filteredProducts.map((p) => p.id));
    });
  };

  const doBulkDelete = () => {
    const next = products.filter((p) => !selectedIds.has(p.id)).map((p, i) => ({ ...p, order: i }));
    saveProducts(next);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  };

  return (
    <div>
      {confirmProductId && <ConfirmDialog onConfirm={doDeleteProduct} onCancel={() => setConfirmProductId(null)} />}
      {confirmBulkDelete && (
        <ConfirmDialog
          title="선택 상품 삭제"
          message={`선택한 ${selectedIds.size}개 상품을 삭제하시겠습니까?`}
          onConfirm={doBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {/* 하위 탭 */}
      <div className="flex border-b border-[#e8e8e8]">
        {([["category", "상품 카테고리 관리"], ["products", "상품추가 관리"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => { setSubTab(id); if (id === "category") setSectionFilter((f) => f === "all" ? "kitchen" : f); }}
            className={`relative flex-1 py-2.5 text-[13px] font-semibold transition-colors outline-none after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:transition-colors ${
              subTab === id
                ? "text-[#c90f45] after:bg-[#c90f45]"
                : "text-[#888] after:bg-transparent hover:text-[#555] hover:after:bg-[#e8c0cb]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 버튼 영역 — 상품카테고리관리 탭일 때 숨김 */}
      <div className={`mt-4 mb-4 flex justify-end gap-2 ${subTab === "category" ? "invisible h-8" : ""}`}>
        <button
          type="button"
          onClick={() => reload()}
          title="새로고침 (페이지 새로고침 없이 목록·썸네일을 다시 불러옵니다)"
          className="h-8 rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#555]"
        >
          ↻ 새로고침
        </button>
        <button
          type="button"
          onClick={() => downloadProductsExcel(filteredProducts, sections)}
          disabled={filteredProducts.length === 0}
          className="h-8 rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#555] disabled:opacity-40"
        >
          ↓ 엑셀 다운로드
        </button>
        <button
          type="button"
          onClick={() => downloadExcelTemplate(sections)}
          className="h-8 rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#555]"
        >
          ↓ 엑셀 양식 다운로드
        </button>
        <button
          type="button"
          onClick={() => setExcelModal(true)}
          className="h-8 rounded-full border border-[#e8e8e8] px-4 text-[12px] font-semibold text-[#555] hover:border-[#555]"
        >
          엑셀 업로드
        </button>
        <button
          type="button"
          onClick={() => setModal({ open: true, editing: null })}
          className="h-8 rounded-full bg-[#c90f45] px-4 text-[12px] font-bold text-white hover:opacity-90"
        >
          + 상품 추가
        </button>
      </div>

      {/* 상위 카테고리(섹션) 관리 — 카테고리 관리 탭에서만 표시 */}
      {subTab === "category" && (
        <SectionManager sections={sections} onChange={saveSections} />
      )}

      {/* 섹션 탭 (공통) */}
      <div className="mb-3 flex border-b border-[#e8e8e8]">
        {(subTab === "category" ? sections.map((s) => s.id) : ["all", ...sections.map((s) => s.id)]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSectionFilter(s)}
            className={`relative flex-1 py-2.5 text-[13px] font-bold transition-colors outline-none after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:transition-colors ${
              sectionFilter === s
                ? "text-[#1a1a1a] after:bg-[#1a1a1a]"
                : "text-[#aaa] after:bg-transparent hover:text-[#555]"
            }`}
          >
            {s === "all" ? "전체" : sectionLabel(s)}
          </button>
        ))}
      </div>

      {/* 하위 카테고리 (상품추가 관리 탭에서만 표시, 전체 탭에서는 숨김) */}
      {subTab === "products" && sectionFilter !== "all" && (
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-[#f0f0f0] pb-4 pl-2">
          <span className="flex items-center pr-1 text-[11px] text-[#bbb]">└</span>
          {["전체", ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium whitespace-nowrap transition-colors ${
                filterCat === cat
                  ? "border-[#c90f45] bg-[#c90f45] text-white"
                  : "border-[#e8e8e8] text-[#888] hover:border-[#c90f45] hover:text-[#c90f45]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

{/* 검색 (상품추가 관리 탭에서만 표시) */}
      {subTab === "products" && (
        <div className="mb-4">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#e8e8e8] bg-white px-4 py-3 focus-within:border-[#c90f45]">
            <svg className="h-4 w-4 shrink-0 text-[#aaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명, 모델번호, 카테고리 검색..."
              className="flex-1 text-[14px] outline-none placeholder:text-[#bbb]"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="shrink-0 text-[#bbb] hover:text-[#888]">
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 상품 카테고리 관리 */}
      {subTab === "category" && (
        loading ? <AdminLoading /> : <CategoryManager section={section} categories={categories} onChange={saveCategories} />
      )}

      {/* 상품추가 관리 */}
      {subTab === "products" && (
        <>
          {loading ? <AdminLoading /> : <>
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[12px] text-[#aaa]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                disabled={filteredProducts.length === 0}
                className="h-3.5 w-3.5 accent-[#c90f45]"
              />
              총 {filteredProducts.length}개 상품
              {selectedIds.size > 0 && <span className="text-[#c90f45] font-semibold">· {selectedIds.size}개 선택됨</span>}
            </label>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-7 rounded-full border border-[#e8e8e8] px-3 text-[11px] text-[#888] hover:border-[#555]"
                >
                  선택 해제
                </button>
                <button
                  type="button"
                  onClick={() => bulkSetVisibility(selectedIds, true)}
                  className="h-7 rounded-full border border-[#e8e8e8] px-3 text-[11px] font-semibold text-[#2f9e5c] hover:border-[#2f9e5c]"
                >
                  선택 노출 켜기
                </button>
                <button
                  type="button"
                  onClick={() => bulkSetVisibility(selectedIds, false)}
                  className="h-7 rounded-full border border-[#e8e8e8] px-3 text-[11px] font-semibold text-[#888] hover:border-[#555]"
                >
                  선택 노출 끄기
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBulkDelete(true)}
                  className="h-7 rounded-full border border-red-300 px-3 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                >
                  선택 삭제
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => {
                const fromIdx = dragFromProductId ? filteredProducts.findIndex((p) => p.id === dragFromProductId) : -1;
                const isOver = dragOverProductId === product.id && fromIdx !== -1 && fromIdx !== idx;
                const insertAbove = isOver && fromIdx > idx;
                const insertBelow = isOver && fromIdx < idx;
                return (
                <div key={product.id}>
                  {insertAbove && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
                  <ProductRow
                    product={product}
                    onEdit={() => setModal({ open: true, editing: product })}
                    onDelete={() => deleteProduct(product.id)}
                    onToggleVisibility={() => toggleVisibility(product)}
                    onDragStart={() => { dragProductId.current = product.id; setDragFromProductId(product.id); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverProductId(product.id); }}
                    onDrop={() => handleProductDrop(product.id)}
                    onDragEnd={() => { dragProductId.current = null; setDragFromProductId(null); setDragOverProductId(null); }}
                    isDragOver={false}
                    isDragging={dragFromProductId === product.id}
                    showSection={sectionFilter === "all"}
                    sectionLabel={sectionLabel}
                    imgRetryKey={imgRetryKey}
                    selected={selectedIds.has(product.id)}
                    onToggleSelect={() => toggleSelect(product.id)}
                  />
                  {insertBelow && <div className="my-0.5 h-0.5 rounded-full bg-[#c90f45]" />}
                </div>
                );
              })
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#f0f0f0] py-12 text-center text-[14px] text-[#bbb]">
                상품이 없습니다. 상품을 추가해 주세요.
              </div>
            )}
          </div>
          </>}
        </>
      )}

      {modal.open && (
        <ProductModal
          initial={modal.editing}
          section={section}
          sections={sections}
          onSave={addOrEdit}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}

      {excelModal && (
        <ExcelUploadModal
          sections={sections}
          defaultSection={section}
          onImport={importFromExcel}
          onClose={() => setExcelModal(false)}
        />
      )}
    </div>
  );
}
