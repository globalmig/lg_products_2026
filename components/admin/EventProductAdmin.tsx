"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminStore, type EventProductRef } from "@/lib/adminStore";
import { productStore, type ManagedProduct, SECTION_LABELS, type Section } from "@/lib/productStore";

export default function EventProductAdmin() {
  const [refs, setRefs] = useState<EventProductRef[]>([]);
  const [allProducts, setAllProducts] = useState<ManagedProduct[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSection, setPickerSection] = useState<Section>("kitchen");
  const [pickerSearch, setPickerSearch] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminStore.eventProducts.get().then(setRefs);
    productStore.products.get().then(setAllProducts);
  }, []);

  const persist = async (next: EventProductRef[]) => {
    setRefs(next);
    await adminStore.eventProducts.set(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const addProduct = (product: ManagedProduct) => {
    if (refs.some((r) => r.product_id === product.id)) return;
    persist([...refs, { id: `ep_${Date.now()}`, product_id: product.id }]);
  };

  const removeProduct = (id: string) => {
    persist(refs.filter((r) => r.id !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...refs];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    persist(next);
  };

  const resolvedProducts = refs
    .map((ref) => ({ ref, product: allProducts.find((p) => p.id === ref.product_id) }))
    .filter((r): r is { ref: EventProductRef; product: ManagedProduct } => r.product !== undefined);

  const SECTIONS: Section[] = ["kitchen", "tv", "air", "living"];

  const pickerProducts = allProducts
    .filter((p) => p.section === pickerSection)
    .filter((p) =>
      pickerSearch === "" ||
      p.name.includes(pickerSearch) ||
      p.model.includes(pickerSearch) ||
      p.category.includes(pickerSearch)
    );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">이달의 행사 제품 관리</h2>
          <p className="mt-0.5 text-[12px] text-[#aaa]">메인화면 &quot;이달의 행사 제품&quot; 섹션에 표시할 상품을 선택합니다</p>
        </div>
        <div className="flex gap-2">
          {saved && <span className="flex h-9 items-center text-[13px] font-semibold text-[#03c75a]">저장됨 ✓</span>}
          <button type="button" onClick={() => setPickerOpen(true)}
            className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90">
            + 상품 추가
          </button>
        </div>
      </div>

      {resolvedProducts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#f0f0f0] py-12 text-center text-[14px] text-[#bbb]">
          행사 상품이 없습니다. 상품을 추가해 주세요.
        </div>
      ) : (
        <div className="space-y-2">
          {resolvedProducts.map(({ ref, product }, idx) => (
            <div key={ref.id} className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-white px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                  className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▲</button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === resolvedProducts.length - 1}
                  className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▼</button>
              </div>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
                {product.image ? (
                  <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" unoptimized />
                ) : (
                  <span className="flex h-full items-center justify-center text-[9px] text-[#ccc]">없음</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#1a1a1a]">{product.name}</p>
                <p className="text-[11px] text-[#999]">
                  {SECTION_LABELS[product.section]} · {product.category} · {product.model}
                </p>
                <p className="text-[12px] font-bold text-[#c90f45]">월 {product.monthlyPrice.toLocaleString()}원</p>
              </div>
              <button type="button" onClick={() => removeProduct(ref.id)}
                className="h-8 shrink-0 rounded-lg border border-[#e8e8e8] px-3 text-[12px] text-[#999] hover:border-red-300 hover:text-red-500">
                제거
              </button>
            </div>
          ))}
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex h-[80vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#1a1a1a]">행사 상품 선택</h3>
              <button type="button" onClick={() => setPickerOpen(false)} className="text-[20px] text-[#999]">✕</button>
            </div>
            <div className="flex gap-1 border-b border-[#f0f0f0] px-5 py-3">
              {SECTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setPickerSection(s)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${pickerSection === s ? "bg-[#1a1a1a] text-white" : "border border-[#e8e8e8] text-[#555]"}`}>
                  {SECTION_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="border-b border-[#f0f0f0] px-5 py-3">
              <input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="상품명, 모델번호 검색..."
                className="h-9 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {pickerProducts.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-[#bbb]">상품이 없습니다.</p>
              ) : (
                <div className="space-y-1">
                  {pickerProducts.map((product) => {
                    const alreadyAdded = refs.some((r) => r.product_id === product.id);
                    return (
                      <button key={product.id} type="button" onClick={() => { if (!alreadyAdded) addProduct(product); }}
                        disabled={alreadyAdded}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${alreadyAdded ? "bg-[#f5f5f5] opacity-50 cursor-not-allowed" : "hover:bg-[#fff0f3]"}`}>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
                          {product.image ? (
                            <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-1" unoptimized />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[9px] text-[#ccc]">없음</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-[#1a1a1a]">{product.name}</p>
                          <p className="text-[11px] text-[#999]">{product.category} · 월 {product.monthlyPrice.toLocaleString()}원</p>
                        </div>
                        {alreadyAdded
                          ? <span className="shrink-0 text-[11px] text-[#bbb]">추가됨</span>
                          : <span className="shrink-0 rounded-full bg-[#c90f45] px-3 py-1 text-[11px] font-bold text-white">추가</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t border-[#f0f0f0] px-5 py-3">
              <button type="button" onClick={() => setPickerOpen(false)}
                className="h-9 w-full rounded-full bg-[#1a1a1a] text-[13px] font-bold text-white hover:opacity-90">완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
