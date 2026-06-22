"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  productStore,
  SECTION_LABELS,
  type Section,
  type ManagedProduct,
  type ManagedCategory,
} from "@/lib/productStore";

const SECTIONS: Section[] = ["kitchen", "tv", "air", "living"];

const EMPTY_PRODUCT: Omit<ManagedProduct, "id" | "order"> = {
  section: "kitchen",
  category: "",
  name: "",
  model: "",
  monthlyPrice: 0,
  benefitPrice: null,
  tags: [],
  image: "",
  detailImage: "",
  isBest: false,
};

/* ────── 상품 편집 모달 ────── */
function ProductModal({
  initial,
  section,
  categories,
  onSave,
  onClose,
}: {
  initial: ManagedProduct | null;
  section: Section;
  categories: ManagedCategory[];
  onSave: (p: Omit<ManagedProduct, "id" | "order">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<ManagedProduct, "id" | "order">>(
    initial
      ? { section: initial.section, category: initial.category, name: initial.name, model: initial.model, monthlyPrice: initial.monthlyPrice, benefitPrice: initial.benefitPrice, tags: initial.tags, image: initial.image, detailImage: initial.detailImage ?? "", isBest: initial.isBest }
      : { ...EMPTY_PRODUCT, section, category: categories[0]?.name ?? "" }
  );
  const [tagInput, setTagInput] = useState("");
  const [tagType, setTagType] = useState("naver");
  const [thumbPreview, setThumbPreview] = useState<string>(initial?.image ?? "");
  const [detailPreview, setDetailPreview] = useState<string>(initial?.detailImage ?? "");
  const thumbRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const makeFileHandler = (
    setPreview: (v: string) => void,
    field: "image" | "detailImage"
  ) => (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      set(field, result);
    };
    reader.readAsDataURL(file);
  };

  const handleThumb = makeFileHandler(setThumbPreview, "image");
  const handleDetail = makeFileHandler(setDetailPreview, "detailImage");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    if (!tagInput.trim()) return;
    set("tags", [...form.tags, { label: tagInput.trim(), type: tagType }]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">{initial ? "상품 수정" : "상품 추가"}</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-3">
          {/* 카테고리 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
            >
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#555]">월 구독료 (원)</label>
              <input type="number" value={form.monthlyPrice} onChange={(e) => set("monthlyPrice", Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#555]">최대혜택가 (원, 없으면 비워두기)</label>
              <input type="number" value={form.benefitPrice ?? ""} onChange={(e) => set("benefitPrice", e.target.value === "" ? null : Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="없음" />
            </div>
          </div>

          {/* 썸네일 이미지 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">썸네일 이미지 <span className="font-normal text-[#aaa]">(목록에 표시)</span></label>
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

          {/* 상세 배너 이미지 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">상세 배너 이미지 <span className="font-normal text-[#aaa]">(상세 페이지에 표시)</span></label>
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
          <button type="button" onClick={() => onSave(form)}
            className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90">저장</button>
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

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const next = sorted.map((c, i) => {
      if (i === idx) return { ...c, order: sorted[swapIdx].order };
      if (i === swapIdx) return { ...c, order: sorted[idx].order };
      return c;
    });
    onChange(next);
  };

  const add = () => {
    if (!newName.trim()) return;
    onChange([...categories, { id: `${section}_cat_${Date.now()}`, section, name: newName.trim(), order: categories.length }]);
    setNewName("");
  };

  const del = (id: string) => {
    if (!confirm("이 카테고리를 삭제하면 해당 카테고리의 상품도 모두 삭제됩니다. 계속하시겠습니까?")) return;
    onChange(categories.filter((c) => c.id !== id));
  };

  const save = (id: string) => {
    onChange(categories.map((c) => c.id === id ? { ...c, name: editName } : c));
    setEditingId(null);
  };

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-6 rounded-2xl border border-[#f0f0f0] bg-white p-4">
      <p className="mb-3 text-[13px] font-bold text-[#1a1a1a]">카테고리 관리</p>
      <div className="space-y-1">
        {sorted.map((cat, idx) => (
          <div key={cat.id} className="flex items-center gap-2 rounded-xl bg-[#fafafa] px-3 py-2">
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => move(cat.id, -1)} disabled={idx === 0} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▲</button>
              <button type="button" onClick={() => move(cat.id, 1)} disabled={idx === sorted.length - 1} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▼</button>
            </div>
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
                <button type="button" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-[11px] text-[#888] hover:text-[#c90f45]">수정</button>
                <button type="button" onClick={() => del(cat.id)} className="text-[11px] text-[#bbb] hover:text-[#c90f45]">삭제</button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-9 flex-1 rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="새 카테고리 이름" />
        <button type="button" onClick={add} className="h-9 rounded-xl bg-[#c90f45] px-4 text-[13px] font-bold text-white hover:opacity-90">추가</button>
      </div>
    </div>
  );
}

/* ────── 상품 행 ────── */
function ProductRow({ product, isFirst, isLast, onMoveUp, onMoveDown, onEdit, onDelete }: {
  product: ManagedProduct;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-white px-4 py-3">
      {/* 순서 */}
      <div className="flex flex-col gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={isFirst} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▲</button>
        <button type="button" onClick={onMoveDown} disabled={isLast} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▼</button>
      </div>

      {/* 이미지 */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
        {product.image && !imgError ? (
          <Image src={product.image} alt="" fill className="object-contain p-1" onError={() => setImgError(true)} unoptimized />
        ) : (
          <span className="flex h-full items-center justify-center text-[9px] text-[#ccc]">없음</span>
        )}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#1a1a1a]">{product.name}</p>
        <p className="text-[11px] text-[#999]">{product.model} · {product.category}</p>
        <p className="text-[12px] font-bold text-[#c90f45]">월 {product.monthlyPrice.toLocaleString()}원</p>
      </div>

      {/* 베스트 뱃지 */}
      {product.isBest && (
        <span className="shrink-0 rounded-full bg-[#fff0f4] px-2 py-0.5 text-[10px] font-bold text-[#c90f45]">베스트</span>
      )}

      {/* 액션 */}
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={onEdit} className="h-8 rounded-lg border border-[#e8e8e8] px-3 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]">수정</button>
        <button type="button" onClick={onDelete} className="h-8 rounded-lg border border-[#e8e8e8] px-3 text-[12px] text-[#999] hover:border-[#c90f45] hover:text-[#c90f45]">삭제</button>
      </div>
    </div>
  );
}

/* ────── 메인 ────── */
export default function ProductAdmin() {
  const [subTab, setSubTab] = useState<"category" | "products">("category");
  const [section, setSection] = useState<Section>("kitchen");
  const [products, setProductsState] = useState<ManagedProduct[]>([]);
  const [categories, setCategoriesState] = useState<ManagedCategory[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: ManagedProduct | null }>({ open: false, editing: null });
  const [filterCat, setFilterCat] = useState<string>("전체");
  const [search, setSearch] = useState("");

  const reload = () =>
    Promise.all([
      productStore.products.getBySection(section),
      productStore.categories.getBySection(section),
    ]).then(([prods, cats]) => {
      setProductsState(prods);
      setCategoriesState(cats);
    });

  useEffect(() => {
    reload().then(() => { setFilterCat("전체"); setSearch(""); });
  }, [section]);

  /* 카테고리 저장 */
  const saveCategories = (next: ManagedCategory[]) => {
    setCategoriesState([...next].sort((a, b) => a.order - b.order));
    productStore.categories.setForSection(section, next);
  };

  /* 상품 저장 */
  const saveProducts = (next: ManagedProduct[]) => {
    setProductsState([...next].sort((a, b) => a.order - b.order));
    productStore.products.setForSection(section, next);
  };

  const addOrEdit = (form: Omit<ManagedProduct, "id" | "order">) => {
    let next: ManagedProduct[];
    if (modal.editing) {
      next = products.map((p) => p.id === modal.editing!.id ? { ...p, ...form } : p);
    } else {
      const maxOrder = products.length ? Math.max(...products.map((p) => p.order)) + 1 : 0;
      next = [...products, { ...form, id: `${section}_${Date.now()}`, order: maxOrder }];
    }
    setModal({ open: false, editing: null });
    saveProducts(next);
  };

  const deleteProduct = (id: string) => {
    if (!confirm("이 상품을 삭제하시겠습니까?")) return;
    const next = products.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
    saveProducts(next);
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

  return (
    <div>
      {/* 하위 탭 */}
      <div className="mb-6 flex gap-1 rounded-2xl bg-[#f5f5f5] p-1">
        {([["category", "상품 카테고리 관리"], ["products", "상품추가 관리"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={`flex-1 rounded-xl py-2 text-[13px] font-semibold transition-colors ${
              subTab === id ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#888] hover:text-[#555]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 섹션 탭 (공통) */}
      <div className="mb-6 flex gap-2 border-b border-[#f0f0f0] pb-4">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              section === s ? "bg-[#1a1a1a] text-white" : "border border-[#e8e8e8] text-[#555] hover:border-[#555]"
            }`}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* 상품 카테고리 관리 */}
      {subTab === "category" && (
        <CategoryManager section={section} categories={categories} onChange={saveCategories} />
      )}

      {/* 상품추가 관리 */}
      {subTab === "products" && (
        <>
          {/* 검색 */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명, 모델번호, 카테고리 검색..."
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-4 text-[13px] outline-none focus:border-[#c90f45]"
            />
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {["전체", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCat(cat)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    filterCat === cat ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#555] hover:border-[#555]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={async () => { if (confirm("정적 데이터로 초기화하시겠습니까?")) { await Promise.all([productStore.products.reset(), productStore.categories.reset()]); reload(); } }}
                className="h-8 rounded-full border border-[#e8e8e8] px-3 text-[12px] text-[#999] hover:text-[#555]"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setModal({ open: true, editing: null })}
                className="h-8 rounded-full bg-[#c90f45] px-4 text-[12px] font-bold text-white hover:opacity-90"
              >
                + 상품 추가
              </button>
            </div>
          </div>

          <p className="mb-3 text-[12px] text-[#aaa]">총 {filteredProducts.length}개 상품</p>

          <div className="space-y-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isFirst={idx === 0}
                  isLast={idx === filteredProducts.length - 1}
                  onMoveUp={() => move(product.id, -1)}
                  onMoveDown={() => move(product.id, 1)}
                  onEdit={() => setModal({ open: true, editing: product })}
                  onDelete={() => deleteProduct(product.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#f0f0f0] py-12 text-center text-[14px] text-[#bbb]">
                상품이 없습니다. 상품을 추가해 주세요.
              </div>
            )}
          </div>
        </>
      )}

      {modal.open && (
        <ProductModal
          initial={modal.editing}
          section={section}
          categories={categories}
          onSave={addOrEdit}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}
    </div>
  );
}
