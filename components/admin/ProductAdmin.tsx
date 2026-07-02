"use client";

import { useState, useEffect, useRef } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
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
      : { ...EMPTY_PRODUCT, section, category: categories[0]?.name ?? "" }
  );
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
      const monthlyPrice = periodPrices[0]?.price ?? form.monthlyPrice;
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
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">계약기간별 월 구독료 (원)</label>
            <p className="mb-2 text-[11px] text-[#bbb]">첫 번째 항목이 기본가로 사용됩니다.</p>
            <div className="space-y-2">
              {(form.periodPrices ?? []).map((pp, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3 py-2">
                  <input
                    value={pp.label}
                    onChange={(e) => updatePeriodPrice(i, "label", e.target.value)}
                    className="h-8 w-24 shrink-0 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                    placeholder="72개월"
                  />
                  <input
                    type="number"
                    value={pp.price || ""}
                    onChange={(e) => updatePeriodPrice(i, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                    className="h-8 flex-1 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[12px] outline-none focus:border-[#c90f45]"
                    placeholder="금액 (원)"
                  />
                  <button type="button" onClick={() => removePeriodPrice(i)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eee] text-[11px] text-[#888] hover:bg-[#c90f45] hover:text-white">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addPeriodPrice} className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#e0e0e0] text-[12px] text-[#bbb] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors">
              + 기간 추가
            </button>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">최대혜택가 (원, 없으면 비워두기)</label>
            <input type="number" value={form.benefitPrice ?? ""} onChange={(e) => set("benefitPrice", e.target.value === "" ? null : Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" placeholder="없음" />
          </div>

          {/* 케어서비스 주기 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">케어서비스 주기 <span className="font-normal text-[#aaa]">(선택)</span></label>
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
                    ⚠ EUC-KR 인코딩 HTML이 감지되었습니다. 한글이 깨질 수 있습니다. 메모장에서 UTF-8로 저장 후 다시 붙여넣기 해주세요. (파일 → 다른 이름으로 저장 → 인코딩: UTF-8)
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
async function downloadExcelTemplate(categories: ManagedCategory[]) {
  const XLSX = await import("xlsx");
  const headers = [
    "카테고리", "상품명", "모델번호",
    "72개월_구독료", "60개월_구독료", "48개월_구독료", "36개월_구독료",
    "최대혜택가", "케어서비스주기", "관리주기", "색상",
    "베스트상품(Y/N)", "태그(라벨:타입,라벨2:타입2)",
  ];
  const example = [
    categories[0]?.name ?? "카테고리명",
    "예시 상품명", "ABCD-1234",
    45900, 49900, 53900, 57900,
    "", "라이트+", "라이트+ (12개월)", "네이처 그린",
    "N", "네이버페이:naver",
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "상품등록");
  XLSX.writeFile(wb, "상품_업로드_템플릿.xlsx");
}

/* ────── 엑셀 업로드 모달 ────── */
function ExcelUploadModal({
  section,
  sectionLabel,
  categories,
  onImport,
  onClose,
}: {
  section: Section;
  sectionLabel: string;
  categories: ManagedCategory[];
  onImport: (products: Omit<ManagedProduct, "id" | "order">[]) => void;
  onClose: () => void;
}) {
  const [parsed, setParsed] = useState<Omit<ManagedProduct, "id" | "order">[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);


  const handleFile = async (file: File) => {
    setError("");
    setParsed([]);
    setFileName(file.name);
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const results: Omit<ManagedProduct, "id" | "order">[] = [];
      const errors: string[] = [];

      rows.forEach((row, i) => {
        const rowNum = i + 2;
        const name = String(row["상품명"] ?? "").trim();
        const monthlyPrice = Number(row["72개월_구독료"] ?? 0);
        if (!name) { errors.push(`${rowNum}행: 상품명 필수`); return; }
        if (!monthlyPrice) { errors.push(`${rowNum}행: 72개월 구독료 필수`); return; }

        const category = String(row["카테고리"] ?? "").trim() || (categories[0]?.name ?? "");
        const tagsRaw = String(row["태그(라벨:타입,라벨2:타입2)"] ?? "").trim();
        const tags = tagsRaw
          ? tagsRaw.split(",").map((t) => {
              const [label, type] = t.split(":").map((s) => s.trim());
              return { label: label ?? t.trim(), type: type ?? "naver" };
            }).filter((t) => t.label)
          : [];

        results.push({
          section,
          category,
          name,
          model: String(row["모델번호"] ?? "").trim(),
          monthlyPrice,
          price60: row["60개월_구독료"] ? Number(row["60개월_구독료"]) : null,
          price48: row["48개월_구독료"] ? Number(row["48개월_구독료"]) : null,
          price36: row["36개월_구독료"] ? Number(row["36개월_구독료"]) : null,
          benefitPrice: row["최대혜택가"] ? Number(row["최대혜택가"]) : null,
          careService: String(row["케어서비스주기"] ?? "").trim() || undefined,
          manageCycle: String(row["관리주기"] ?? "").trim() || undefined,
          color: String(row["색상"] ?? "").trim() || undefined,
          tags,
          image: "",
          detailImage: "",
          isBest: String(row["베스트상품(Y/N)"] ?? "").trim().toUpperCase() === "Y",
        });
      });

      if (errors.length > 0) setError(errors.join(" / "));
      setParsed(results);
    } catch {
      setError("파일을 읽을 수 없습니다. xlsx 형식인지 확인해주세요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">엑셀로 상품 일괄 등록</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* 안내 */}
          <div className="rounded-xl bg-[#fafafa] border border-[#f0f0f0] px-4 py-3 text-[12px] text-[#666] leading-[1.8]">
            <p className="font-semibold text-[#333] mb-1">안내사항</p>
            <p>· 이미지는 엑셀로 등록 후 개별 상품 수정에서 직접 확인·추가해 주세요.</p>
            <p>· 현재 선택된 섹션 <strong className="text-[#c90f45]">{sectionLabel}</strong> 에 등록됩니다.</p>
            <p>· 카테고리명은 이미 등록된 카테고리명과 정확히 일치해야 합니다.</p>
          </div>

          {/* 템플릿 다운로드 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadExcelTemplate(categories)}
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
              <p className="mb-2 text-[13px] font-semibold text-[#333]">미리보기 ({parsed.length}개 상품)</p>
              <div className="overflow-x-auto rounded-xl border border-[#f0f0f0]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                      <th className="px-3 py-2 text-left font-semibold text-[#555]">카테고리</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#555]">상품명</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#555]">모델번호</th>
                      <th className="px-3 py-2 text-right font-semibold text-[#555]">72개월</th>
                      <th className="px-3 py-2 text-center font-semibold text-[#555]">베스트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((p, i) => (
                      <tr key={i} className="border-b border-[#f0f0f0] last:border-0">
                        <td className="px-3 py-2 text-[#666]">{p.category}</td>
                        <td className="px-3 py-2 font-semibold text-[#1a1a1a]">{p.name}</td>
                        <td className="px-3 py-2 text-[#888]">{p.model || "-"}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#c90f45]">{p.monthlyPrice.toLocaleString()}원</td>
                        <td className="px-3 py-2 text-center">{p.isBest ? "✓" : "-"}</td>
                      </tr>
                    ))}
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
            onClick={() => { onImport(parsed); onClose(); }}
            disabled={parsed.length === 0}
            className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-40"
          >
            {parsed.length > 0 ? `${parsed.length}개 상품 가져오기` : "가져오기"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────── 상품 행 ────── */
function ProductRow({ product, onEdit, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, showSection, sectionLabel }: {
  product: ManagedProduct;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isDragging: boolean;
  showSection?: boolean;
  sectionLabel?: (id: string) => string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-white px-4 py-3 transition-all ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {/* 드래그 핸들 */}
      <span className="cursor-grab text-[16px] text-[#ccc] active:cursor-grabbing shrink-0">⠿</span>

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
        <p className="text-[12px] font-bold text-[#c90f45]">월 {product.monthlyPrice.toLocaleString()}원</p>
      </div>

      {/* 베스트 뱃지 */}
      {product.isBest && (
        <span className="shrink-0 rounded-full bg-[#fff0f4] px-2 py-0.5 text-[10px] font-bold text-[#c90f45]">베스트</span>
      )}

      {/* 액션 */}
      <div className="flex shrink-0 gap-2">
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
  const [loading, setLoading] = useState(true);
  const [dragFromProductId, setDragFromProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const dragProductId = useRef<string | null>(null);
  const [sections, setSections] = useState<ManagedSection[]>([]);

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
    if (sectionFilter === "all") {
      return Promise.all(sections.map((s) => productStore.products.getBySection(s.id)))
        .then((allProds) => setProductsState(allProds.flat().sort((a, b) => a.order - b.order)));
    }
    return Promise.all([
      productStore.products.getBySection(sectionFilter),
      productStore.categories.getBySection(sectionFilter),
    ]).then(([prods, cats]) => {
      setProductsState(prods);
      setCategoriesState(cats);
    });
  };

  useEffect(() => {
    if (sectionFilter !== "all") setSection(sectionFilter);
    setLoading(true);
    reload().then(() => { setFilterCat("전체"); setSearch(""); setLoading(false); });
  }, [sectionFilter, sections]);

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
    const maxOrder = products.length ? Math.max(...products.map((p) => p.order)) + 1 : 0;
    const toAdd: ManagedProduct[] = newProducts.map((p, i) => ({
      ...p,
      id: `${p.section}_excel_${Date.now()}_${i}`,
      order: maxOrder + i,
    }));
    await persistProducts([...products, ...toAdd]);
    reload();
  };

  const deleteProduct = (id: string) => setConfirmProductId(id);

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

  return (
    <div>
      {confirmProductId && <ConfirmDialog onConfirm={doDeleteProduct} onCancel={() => setConfirmProductId(null)} />}

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
          onClick={() => downloadExcelTemplate(categories)}
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
          <p className="mb-3 text-[12px] text-[#aaa]">총 {filteredProducts.length}개 상품</p>

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
                    onDragStart={() => { dragProductId.current = product.id; setDragFromProductId(product.id); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverProductId(product.id); }}
                    onDrop={() => handleProductDrop(product.id)}
                    onDragEnd={() => { dragProductId.current = null; setDragFromProductId(null); setDragOverProductId(null); }}
                    isDragOver={false}
                    isDragging={dragFromProductId === product.id}
                    showSection={sectionFilter === "all"}
                    sectionLabel={sectionLabel}
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
          categories={categories}
          onSave={addOrEdit}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}

      {excelModal && (
        <ExcelUploadModal
          section={section}
          sectionLabel={sectionLabel(section)}
          categories={categories}
          onImport={importFromExcel}
          onClose={() => setExcelModal(false)}
        />
      )}
    </div>
  );
}
