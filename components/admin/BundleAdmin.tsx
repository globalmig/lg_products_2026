"use client";

import { useState, useEffect } from "react";
import { LuPencil, LuTrash2, LuX, LuPlus } from "react-icons/lu";
import { bundleStore, type ProductBundle, type ProductBundleItem } from "@/lib/productBundles";
import { productStore, type ManagedProduct } from "@/lib/productStore";

const EMPTY: Omit<ProductBundle, "id"> = { name: "", items: [], discountPercent: 5, sortOrder: 0 };

function BundleModal({
  initial,
  maxOrder,
  allProducts,
  onSave,
  onClose,
}: {
  initial: ProductBundle | null;
  maxOrder: number;
  allProducts: ManagedProduct[];
  onSave: (bundle: ProductBundle) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? EMPTY.name);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent ?? EMPTY.discountPercent);
  const [items, setItems] = useState<ProductBundleItem[]>(initial?.items ?? []);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const isSelected = (p: ManagedProduct) => items.some((it) => it.section === p.section && it.productId === p.id);

  const toggleProduct = (p: ManagedProduct) => {
    setItems((prev) =>
      prev.some((it) => it.section === p.section && it.productId === p.id)
        ? prev.filter((it) => !(it.section === p.section && it.productId === p.id))
        : [...prev, { section: p.section, productId: p.id }]
    );
  };

  const filtered = allProducts.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProducts = items
    .map((it) => allProducts.find((p) => p.section === it.section && p.id === it.productId))
    .filter((p): p is ManagedProduct => p !== undefined);

  const canSave = name.trim() !== "" && items.length >= 2;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const bundle: ProductBundle = {
        id: initial?.id ?? `bundle_${Date.now()}`,
        name: name.trim(),
        items,
        discountPercent,
        sortOrder: initial?.sortOrder ?? maxOrder,
      };
      onSave(bundle);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]";
  const labelCls = "mb-1 block text-[12px] font-semibold text-[#555]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4 shrink-0">
          <h3 className="text-[16px] font-bold">{initial ? "패키지 수정" : "패키지 추가"}</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>패키지명</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="예: 정수기+인덕션" />
          </div>

          <div>
            <label className={labelCls}>할인율 (%)</label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className={inputCls}
              placeholder="예: 5"
            />
          </div>

          <div>
            <label className={labelCls}>구성 상품 <span className="font-normal text-[#aaa]">(2개 이상 선택)</span></label>

            {selectedProducts.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedProducts.map((p) => (
                  <span key={`${p.section}_${p.id}`} className="flex items-center gap-1 rounded-full bg-[#fdf3f5] px-3 py-1 text-[12px] font-medium text-[#c90f45]">
                    {p.name}
                    <button type="button" onClick={() => toggleProduct(p)} className="text-[#c90f45]/60 hover:text-[#c90f45]">
                      <LuX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls}
              placeholder="상품명 또는 모델명 검색"
            />
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#f0f0f0]">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-[12px] text-[#bbb]">검색 결과가 없습니다.</p>
              ) : (
                filtered.slice(0, 50).map((p) => (
                  <button
                    key={`${p.section}_${p.id}`}
                    type="button"
                    onClick={() => toggleProduct(p)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] hover:bg-[#fafafa] ${
                      isSelected(p) ? "bg-[#fdf3f5] text-[#c90f45]" : "text-[#333]"
                    }`}
                  >
                    <span className="truncate">{p.name} <span className="text-[#aaa]">· {p.model}</span></span>
                    {isSelected(p) ? <LuX size={13} /> : <LuPlus size={13} />}
                  </button>
                ))
              )}
            </div>
            {items.length < 2 && (
              <p className="mt-1.5 text-[11px] text-[#c90f45]">패키지는 상품을 2개 이상 선택해야 합니다.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-t border-[#f0f0f0] px-6 py-4 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 h-10 rounded-full border border-[#e0e0e0] text-[13px] font-semibold text-[#555] hover:bg-[#f5f5f5]">
            취소
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !canSave} className="flex-1 h-10 rounded-full bg-[#c90f45] text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BundleAdmin() {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [allProducts, setAllProducts] = useState<ManagedProduct[]>([]);
  const [modal, setModal] = useState<ProductBundle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductBundle | null>(null);

  const load = async () => setBundles(await bundleStore.get());

  useEffect(() => {
    load();
    Promise.all([
      productStore.products.getBySection("kitchen"),
      productStore.products.getBySection("tv"),
      productStore.products.getBySection("air"),
      productStore.products.getBySection("living"),
    ]).then(([kitchen, tv, air, living]) => setAllProducts([...kitchen, ...tv, ...air, ...living]));
  }, []);

  const openNew = () => { setModal(null); setShowModal(true); };
  const openEdit = (b: ProductBundle) => { setModal(b); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModal(null); };

  const productName = (it: ProductBundleItem) => allProducts.find((p) => p.section === it.section && p.id === it.productId)?.name ?? it.productId;

  const handleSave = async (bundle: ProductBundle) => {
    const next = modal
      ? bundles.map((b) => (b.id === bundle.id ? bundle : b))
      : [...bundles, bundle];
    await bundleStore.setAll(next);
    await load();
    closeModal();
  };

  const handleDelete = async (bundle: ProductBundle) => {
    await bundleStore.setAll(bundles.filter((b) => b.id !== bundle.id));
    await load();
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">묶음 상품(구독 패키지) 관리</h2>
          <p className="mt-0.5 text-[13px] text-[#888]">상품 상세페이지에서 함께 구독할 수 있는 상품 조합과 할인율을 관리합니다.</p>
        </div>
        <button type="button" onClick={openNew} className="flex h-9 items-center gap-1.5 rounded-full bg-[#c90f45] px-4 text-[13px] font-bold text-white hover:opacity-90">
          + 패키지 추가
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fafafa] text-[#888]">
              <th className="px-4 py-3 text-left font-semibold">패키지명</th>
              <th className="px-4 py-3 text-left font-semibold">구성 상품</th>
              <th className="px-4 py-3 text-right font-semibold">할인율</th>
              <th className="px-4 py-3 text-right font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                <td className="px-4 py-3 font-medium text-[#1a1a1a]">{b.name}</td>
                <td className="px-4 py-3 text-[#555]">{b.items.map(productName).join(" + ")}</td>
                <td className="px-4 py-3 text-right font-bold text-[#c90f45]">{b.discountPercent}%</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(b)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e0e0e0] text-[#555] hover:border-[#999]" title="수정"><LuPencil size={13} /></button>
                    <button type="button" onClick={() => setDeleteTarget(b)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ffdde5] text-[#c90f45] hover:bg-[#fff0f3]" title="삭제"><LuTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {bundles.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[13px] text-[#bbb]">등록된 패키지가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <BundleModal
          initial={modal}
          maxOrder={bundles.length}
          allProducts={allProducts}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="mb-1 text-[16px] font-bold text-[#1a1a1a]">패키지를 삭제하시겠어요?</p>
            <p className="mb-6 text-[13px] text-[#888]">{deleteTarget.name}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-full border border-[#e0e0e0] text-[13px] font-semibold text-[#555]">취소</button>
              <button type="button" onClick={() => handleDelete(deleteTarget)} className="flex-1 h-10 rounded-full bg-[#c90f45] text-[13px] font-bold text-white">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
