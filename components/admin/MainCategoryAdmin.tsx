"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { adminStore, type MainCategoryItem } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

const ICON_OPTIONS = [
  "/images/icon/3D/box.png",
  "/images/icon/3D/coin.png",
  "/images/icon/3D/house.png",
  "/images/icon/3D/timeCoin.png",
  "/images/icon/3D/new.png",
  "/images/icon/3D/saleTag.png",
  "/images/icon/3D/return.png",
  "/images/icon/3D/Wallet.png",
  "/images/icon/3D/clip.png",
  "/images/icon/3D/plus.png",
  "/images/icon/3D/truck.png",
  "/images/icon/3D/gift.png",
  "/images/icon/3D/calendar.png",
];

const DEFAULT_ITEMS: MainCategoryItem[] = [
  { id: "c1",  label: "냉장고",    href: "/products/kitchen?category=냉장고",    image: "/images/icon/3D/box.png",      bg: "#f5ede8", sort_order: 0 },
  { id: "c2",  label: "김치냉장고", href: "/products/kitchen?category=김치냉장고", image: "/images/icon/3D/coin.png",     bg: "#edf2f0", sort_order: 1 },
  { id: "c3",  label: "식기세척기", href: "/products/kitchen?category=식기세척기", image: "/images/icon/3D/house.png",    bg: "#eef2f8", sort_order: 2 },
  { id: "c4",  label: "광파오븐",   href: "/products/kitchen?category=광파오븐",   image: "/images/icon/3D/timeCoin.png", bg: "#f5f2e8", sort_order: 3 },
  { id: "c5",  label: "스탠바이미", href: "/products/tv?category=스탠바이미",      image: "/images/icon/3D/new.png",      bg: "#edf0f5", sort_order: 4 },
  { id: "c6",  label: "OLED TV",   href: "/products/tv?category=OLED",            image: "/images/icon/3D/saleTag.png",  bg: "#f0edf5", sort_order: 5 },
  { id: "c7",  label: "세탁기",     href: "/products/living?category=세탁기",      image: "/images/icon/3D/return.png",   bg: "#edf5f5", sort_order: 6 },
  { id: "c8",  label: "워시타워",   href: "/products/living?category=워시타워",    image: "/images/icon/3D/Wallet.png",   bg: "#f0f5ee", sort_order: 7 },
  { id: "c9",  label: "스타일러",   href: "/products/living?category=스타일러",    image: "/images/icon/3D/clip.png",     bg: "#f5eef2", sort_order: 8 },
  { id: "c10", label: "청소기",     href: "/products/living?category=청소기",      image: "/images/icon/3D/plus.png",     bg: "#f2f0eb", sort_order: 9 },
  { id: "c11", label: "에어컨",     href: "/products/air?category=에어컨",         image: "/images/icon/3D/truck.png",    bg: "#eaf2f8", sort_order: 10 },
  { id: "c12", label: "공기청정기", href: "/products/air?category=공기청정기",     image: "/images/icon/3D/gift.png",     bg: "#eef5ee", sort_order: 11 },
  { id: "c13", label: "안마의자",   href: "/products/living?category=안마의자",    image: "/images/icon/3D/calendar.png", bg: "#f5ede8", sort_order: 12 },
];

const EMPTY: Omit<MainCategoryItem, "id" | "sort_order"> = {
  label: "",
  href: "",
  image: ICON_OPTIONS[0],
  bg: "#f5ede8",
};

export default function MainCategoryAdmin() {
  const [items, setItems] = useState<MainCategoryItem[]>([]);
  const [editing, setEditing] = useState<MainCategoryItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<Omit<MainCategoryItem, "id" | "sort_order">>(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // 드래그 상태
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    adminStore.mainCategories.get().then((data) => {
      setItems(data.length > 0 ? data : DEFAULT_ITEMS);
      if (data.length === 0) adminStore.mainCategories.set(DEFAULT_ITEMS).catch(() => {});
    });
  }, []);

  const persist = async (next: MainCategoryItem[]) => {
    const sorted = next.map((item, i) => ({ ...item, sort_order: i }));
    setItems(sorted);
    await adminStore.mainCategories.set(sorted);
  };

  // 드래그 핸들러
  const onDragStart = (idx: number) => {
    dragIdx.current = idx;
    setDragging(idx);
  };
  const onDragEnter = (idx: number) => setDragOver(idx);
  const onDragEnd = () => {
    if (dragIdx.current !== null && dragOver !== null && dragIdx.current !== dragOver) {
      const next = [...items];
      const [moved] = next.splice(dragIdx.current, 1);
      next.splice(dragOver, 0, moved);
      persist(next);
    }
    dragIdx.current = null;
    setDragging(null);
    setDragOver(null);
  };

  const handleAdd = () => {
    if (!addForm.label.trim()) return;
    persist([...items, { id: `c_${Date.now()}`, ...addForm, sort_order: items.length }]);
    setAddForm(EMPTY);
    setAdding(false);
  };

  const handleEdit = () => {
    if (!editing) return;
    persist(items.map((item) => (item.id === editing.id ? editing : item)));
    setEditing(null);
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.mainCategories.delete(confirmId);
    setItems((prev) => prev.filter((item) => item.id !== confirmId));
    setConfirmId(null);
  };

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-black text-[#1a1a1a]">메인 카테고리 관리</h2>
        <button type="button" onClick={() => { setAdding(true); setEditing(null); }}
          className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90">
          + 카테고리 추가
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">

        {/* ── 왼쪽: 에디터 ── */}
        <div className="space-y-3">
          {adding && (
            <div className="mb-2">
              <p className="mb-2 text-[13px] font-bold text-[#1a1a1a]">새 카테고리 추가</p>
              <ItemForm data={addForm} onChange={setAddForm} onSave={handleAdd} onCancel={() => setAdding(false)} saveLabel="추가" />
            </div>
          )}

          <p className="text-[11px] text-[#aaa]">행을 드래그해서 순서를 변경할 수 있습니다.</p>

          {items.map((item, idx) => (
            <div key={item.id}>
              {editing?.id === item.id ? (
                <ItemForm
                  data={{ label: editing.label, href: editing.href, image: editing.image, bg: editing.bg }}
                  onChange={(v) => setEditing({ ...editing, ...v })}
                  onSave={handleEdit}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all ${
                    dragging === idx ? "opacity-40" : ""
                  } ${
                    dragOver === idx && dragging !== idx
                      ? "border-[#c90f45] shadow-md"
                      : "border-[#f0f0f0]"
                  }`}
                >
                  {/* 드래그 핸들 */}
                  <div className="shrink-0 cursor-grab text-[#ccc] active:cursor-grabbing">
                    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
                      <circle cx="4" cy="4" r="1.8"/><circle cx="10" cy="4" r="1.8"/>
                      <circle cx="4" cy="10" r="1.8"/><circle cx="10" cy="10" r="1.8"/>
                      <circle cx="4" cy="16" r="1.8"/><circle cx="10" cy="16" r="1.8"/>
                    </svg>
                  </div>

                  {/* 아이콘 미리보기 */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                    style={{ backgroundColor: item.bg }}>
                    <Image src={item.image} alt="" fill sizes="40px" className="object-contain p-1.5" unoptimized />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{item.label}</p>
                    <p className="truncate text-[11px] text-[#aaa]">{item.href}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button type="button"
                      onClick={() => { setEditing({ ...item }); setAdding(false); }}
                      className="h-8 rounded-lg border border-[#e8e8e8] px-3 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]">
                      수정
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}
                      className="h-8 rounded-lg border border-[#e8e8e8] px-3 text-[12px] text-[#999] hover:border-red-300 hover:text-red-500">
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[#f0f0f0] py-12 text-center text-[14px] text-[#bbb]">
              카테고리가 없습니다.
            </div>
          )}
        </div>

        {/* ── 오른쪽: GNB 미리보기 ── */}
        <div className="xl:sticky xl:top-20 self-start">
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* 헤더 바 모방 */}
            <div className="flex h-10 items-center justify-between border-b border-[#e8e8e8] bg-white px-4">
              <div className="h-4 w-20 rounded bg-[#e0e0e0]" />
              <div className="flex gap-2">
                <div className="h-3 w-10 rounded bg-[#f0f0f0]" />
                <div className="h-3 w-10 rounded bg-[#f0f0f0]" />
                <div className="h-3 w-10 rounded bg-[#f0f0f0]" />
              </div>
            </div>

            {/* 카테고리 섹션 미리보기 */}
            <div className="p-4">
              <p className="mb-1 text-[11px] font-semibold text-[#aaa]">PREVIEW — 실제 사이트 카테고리 섹션</p>
              <div className="rounded-xl border border-[#f5f5f5] bg-[#fafafa] p-4">
                <p className="mb-3 text-[13px] font-black tracking-tight text-[#1a1a1a]">카테고리</p>
                <div className="flex flex-wrap gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col items-center gap-1.5" style={{ width: 56 }}>
                      <div
                        className="relative h-14 w-14 overflow-hidden rounded-full shadow-sm"
                        style={{ backgroundColor: item.bg }}
                      >
                        <Image src={item.image} alt={item.label} fill sizes="56px"
                          className="object-contain p-2" unoptimized />
                      </div>
                      <span className="text-center text-[10px] font-medium leading-tight text-[#333]"
                        style={{ maxWidth: 56, wordBreak: "keep-all" }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 카테고리 편집 폼 ── */
function ItemForm({
  data, onChange, onSave, onCancel, saveLabel = "저장",
}: {
  data: Omit<MainCategoryItem, "id" | "sort_order">;
  onChange: (v: Omit<MainCategoryItem, "id" | "sort_order">) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const isCustom = data.image.startsWith("data:");
  const [mode, setMode] = useState<"icon" | "upload">(isCustom ? "upload" : "icon");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange({ ...data, image: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="이름">
          <input value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })}
            className="h-9 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
            placeholder="예) 냉장고" />
        </Field>
        <Field label="링크 URL">
          <input value={data.href} onChange={(e) => onChange({ ...data, href: e.target.value })}
            className="h-9 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
            placeholder="예) /products/kitchen?category=냉장고" />
        </Field>
      </div>

      <Field label="배경 색상">
        <div className="flex items-center gap-2">
          <input type="color" value={data.bg} onChange={(e) => onChange({ ...data, bg: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-lg border border-[#e8e8e8] p-0.5" />
          <span className="text-[12px] text-[#999]">{data.bg}</span>
        </div>
      </Field>

      <Field label="이미지">
        <div className="mb-3 flex gap-1 rounded-xl bg-[#f0f0f0] p-1">
          {([["icon", "기본 아이콘 선택"], ["upload", "직접 업로드"]] as const).map(([m, label]) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition-colors ${mode === m ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#888]"}`}>
              {label}
            </button>
          ))}
        </div>

        {mode === "icon" && (
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button key={icon} type="button" onClick={() => onChange({ ...data, image: icon })}
                className={`relative h-12 w-12 overflow-hidden rounded-xl border-2 transition-colors ${data.image === icon ? "border-[#c90f45]" : "border-[#e8e8e8] hover:border-[#c90f45]/40"}`}
                style={{ backgroundColor: data.bg }}>
                <Image src={icon} alt="" fill sizes="48px" className="object-contain p-1" unoptimized />
              </button>
            ))}
          </div>
        )}

        {mode === "upload" && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-5 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors">
              {isCustom ? (
                <div className="relative h-16 w-16" style={{ backgroundColor: data.bg }}>
                  <Image src={data.image} alt="미리보기" fill className="object-contain rounded-lg p-1" unoptimized />
                </div>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              )}
              <p className="text-[12px] text-[#aaa]">{isCustom ? "클릭하여 변경" : "클릭하거나 드래그하여 이미지 업로드"}</p>
              <p className="text-[11px] text-[#bbb]">권장: 120 × 120px · PNG · 투명 배경</p>
            </div>
            {isCustom && (
              <button type="button"
                onClick={() => { onChange({ ...data, image: ICON_OPTIONS[0] }); if (fileRef.current) fileRef.current.value = ""; }}
                className="mt-1.5 text-[11px] text-[#bbb] hover:text-[#c90f45]">
                이미지 삭제 (기본 아이콘으로 되돌리기)
              </button>
            )}
          </>
        )}
      </Field>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onSave}
          className="h-9 rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90">{saveLabel}</button>
        <button type="button" onClick={onCancel}
          className="h-9 rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]">취소</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[12px] font-semibold text-[#666]">{label}</p>
      {children}
    </div>
  );
}
