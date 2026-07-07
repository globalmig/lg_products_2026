"use client";

import { useEffect, useRef, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import Image from "next/image";
import {
  adminStore,
  uploadImage,
  imageUrl,
  getReviewVisibility,
  DEFAULT_REVIEW_VISIBILITY,
  type Review,
  type ReviewVisibility,
  type ReviewVisibilityMap,
} from "@/lib/adminStore";
import { productStore, SECTION_LABELS, type ManagedProduct } from "@/lib/productStore";
import ConfirmDialog from "./ConfirmDialog";
import NewsEventAdmin from "./NewsEventAdmin";

type ReviewTab = "manage" | "newsEvent";

const EMPTY: Omit<Review, "id" | "sort_order"> = {
  stars: 5,
  image_key: "",
  content: "",
  name: "",
  product: "",
  date: "",
};

export default function ReviewAdmin() {
  const [tab, setTab] = useState<ReviewTab>("manage");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [visibility, setVisibility] = useState<ReviewVisibilityMap>({});
  const [editing, setEditing] = useState<Review | null>(null);
  const [editVisibility, setEditVisibility] = useState<ReviewVisibility>(DEFAULT_REVIEW_VISIBILITY);
  const [adding, setAdding] = useState(false);
  const [addVisibility, setAddVisibility] = useState<ReviewVisibility>(DEFAULT_REVIEW_VISIBILITY);
  const [form, setForm] = useState<Omit<Review, "id" | "sort_order">>(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [reviewData, productData, settings] = await Promise.all([
        adminStore.reviews.get(),
        productStore.products.get(),
        adminStore.siteSettings.get(),
      ]);

      // 예전에는 "리뷰 이벤트 페이지" 탭에서 후기를 따로 작성했었다. 그 데이터가
      // site_settings.news_event.reviews 에 남아있을 수 있으므로, 통합 리뷰 목록에
      // 없는 항목만 한 번 옮겨온다(리뷰 이벤트에서만 보이던 노출 상태를 유지).
      const legacyReviews = ((settings.newsEvent as unknown as { reviews?: Review[] })?.reviews) ?? [];
      const existingIds = new Set(reviewData.map((r) => r.id));
      const toMigrate = legacyReviews.filter((r) => !existingIds.has(r.id));

      let mergedVisibility = settings.reviewVisibility ?? {};
      if (toMigrate.length > 0) {
        await Promise.all(toMigrate.map((r) => adminStore.reviews.add(r)));
        mergedVisibility = { ...mergedVisibility };
        toMigrate.forEach((r) => {
          if (!mergedVisibility[r.id]) mergedVisibility[r.id] = { home: false, newsEvent: true };
        });
        await adminStore.siteSettings.set({ reviewVisibility: mergedVisibility });
      }

      setReviews([...reviewData, ...toMigrate]);
      setProducts(productData);
      setVisibility(mergedVisibility);
      setLoading(false);
    })();
  }, []);

  const persistVisibility = async (id: string, v: ReviewVisibility) => {
    const updated = { ...visibility, [id]: v };
    setVisibility(updated);
    await adminStore.siteSettings.set({ reviewVisibility: updated });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    await adminStore.reviews.update(editing.id, editing);
    setReviews((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
    await persistVisibility(editing.id, editVisibility);
    setEditing(null);
  };

  const handleAdd = async () => {
    const newReview: Review = { id: `r_${Date.now()}`, ...form, sort_order: reviews.length };
    await adminStore.reviews.add(newReview);
    setReviews((prev) => [...prev, newReview]);
    await persistVisibility(newReview.id, addVisibility);
    setForm(EMPTY);
    setAddVisibility(DEFAULT_REVIEW_VISIBILITY);
    setAdding(false);
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.reviews.delete(confirmId);
    setReviews((prev) => prev.filter((r) => r.id !== confirmId));
    if (visibility[confirmId]) {
      const updated = { ...visibility };
      delete updated[confirmId];
      setVisibility(updated);
      await adminStore.siteSettings.set({ reviewVisibility: updated });
    }
    setConfirmId(null);
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      {/* 탭 */}
      <div className="mb-6 flex border-b border-[#e8e8e8]">
        {([
          { id: "manage" as const, label: "리뷰 관리" },
          { id: "newsEvent" as const, label: "리뷰 이벤트 페이지" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative px-5 py-2.5 text-[13px] font-semibold transition-colors outline-none after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:transition-colors ${
              tab === id
                ? "text-[#c90f45] after:bg-[#c90f45]"
                : "text-[#aaa] after:bg-transparent hover:text-[#555]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "newsEvent" ? (
        <NewsEventAdmin />
      ) : (
        <>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">리뷰 관리</h2>
          <p className="mt-1 text-[12px] text-[#999]">여기서 작성한 리뷰를 홈 화면 / 리뷰 이벤트 페이지에 각각 노출할지 선택할 수 있습니다.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white"
        >
          + 리뷰 추가
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-white py-20 text-center text-[14px] text-[#aaa] shadow-sm">
          등록된 리뷰가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const v = getReviewVisibility(visibility, review.id);
            return (
            <div key={review.id} className="rounded-2xl bg-white p-5 shadow-sm">
              {editing?.id === review.id ? (
                <ReviewForm
                  data={editing}
                  onChange={setEditing as (v: Review) => void}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditing(null)}
                  products={products}
                  visibility={editVisibility}
                  onVisibilityChange={setEditVisibility}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {review.image_key && (
                      <Image
                        src={imageUrl(review.image_key)}
                        alt=""
                        width={80}
                        height={60}
                        className="h-15 w-20 shrink-0 rounded-lg object-cover bg-[#f5f5f5]"
                      />
                    )}
                    {!review.image_key && (
                      <div className="flex h-15 w-20 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] text-[11px] text-[#bbb]">
                        이미지 없음
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="mb-1 flex gap-0.5">
                        {Array.from({ length: review.stars }).map((_, i) => (
                          <span key={i} className="text-[14px] text-[#f5a623]">★</span>
                        ))}
                      </div>
                      <p className="line-clamp-2 text-[13px] text-[#555]">{review.content}</p>
                      <p className="mt-1 text-[12px] font-bold text-[#1a1a1a]">{review.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-[#999]">
                        <span>{review.product} · {review.date}</span>
                        {v.home && (
                          <span className="rounded-full bg-[#f0f6ff] px-2 py-0.5 text-[10px] font-semibold text-[#3170e0]">홈 노출</span>
                        )}
                        {v.newsEvent && (
                          <span className="rounded-full bg-[#fdeef2] px-2 py-0.5 text-[10px] font-semibold text-[#c90f45]">리뷰 이벤트 노출</span>
                        )}
                        {!v.home && !v.newsEvent && (
                          <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#999]">비노출</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditing({ ...review });
                        setEditVisibility(v);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]"
                      title="수정"
                    >
                      <LuPencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-red-400 hover:text-red-500" title="삭제"><LuTrash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdding(false)} />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">리뷰 추가</h3>
            <ReviewForm
              data={{ id: "", ...form, sort_order: 0 }}
              onChange={(v) => setForm({ stars: v.stars, image_key: v.image_key, content: v.content, name: v.name, product: v.product, date: v.date })}
              onSave={handleAdd}
              onCancel={() => setAdding(false)}
              saveLabel="추가"
              products={products}
              visibility={addVisibility}
              onVisibilityChange={setAddVisibility}
            />
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

const MANUAL_PRODUCT = "__manual__";

export function ReviewForm({
  data,
  onChange,
  onSave,
  onCancel,
  saveLabel = "저장",
  products,
  visibility,
  onVisibilityChange,
}: {
  data: Review;
  onChange: (v: Review) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  products?: ManagedProduct[];
  visibility: ReviewVisibility;
  onVisibilityChange: (v: ReviewVisibility) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "reviews");
      onChange({ ...data, image_key: key });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const img = imageUrl(data.image_key);

  return (
    <div className="space-y-3">
      {/* 이미지 업로드 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">이미지 (선택)</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] transition-colors"
        >
          {uploading ? (
            <p className="text-[13px] text-[#aaa]">업로드 중...</p>
          ) : img ? (
            <Image src={img} alt="" width={200} height={120} className="max-h-32 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-[12px] text-[#aaa]">클릭해서 이미지 업로드</p>
          )}
          {img && !uploading && <p className="text-[11px] text-[#aaa]">클릭해서 이미지 변경</p>}
          {!img && !uploading && <p className="text-[11px] text-[#bbb]">권장: 800 × 500px · JPG/PNG · 2MB 이하</p>}
        </div>
        {img && (
          <button
            type="button"
            onClick={() => onChange({ ...data, image_key: "" })}
            className="mt-1 text-[11px] text-[#bbb] hover:text-red-400"
          >
            이미지 삭제
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* 별점 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">별점</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...data, stars: s })}
              className={`text-[24px] transition-colors ${s <= data.stars ? "text-[#f5a623]" : "text-[#ddd]"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* 내용 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">리뷰 내용</p>
        <textarea
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          rows={4}
          placeholder="리뷰 내용을 입력하세요"
          className="w-full resize-none rounded-lg border border-[#e8e8e8] px-3 py-2 text-[13px] outline-none focus:border-[#c90f45]"
        />
      </div>

      {/* 작성자 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-[12px] font-semibold text-[#666]">작성자</p>
          <input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="김*현"
            className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>
        <div>
          <p className="mb-1 text-[12px] font-semibold text-[#666]">날짜</p>
          <input
            value={data.date}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            placeholder="2026.05.18"
            className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>
      </div>

      {/* 제품명 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">제품 (상품 페이지)</p>
        {products && products.length > 0 ? (
          <ProductPicker data={data} onChange={onChange} products={products} />
        ) : (
          <input
            value={data.product}
            onChange={(e) => onChange({ ...data, product: e.target.value })}
            placeholder="LG 디오스 오브제컬렉션 냉장고"
            className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        )}
      </div>

      {/* 노출 설정 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">노출 설정</p>
        <div className="flex gap-4 rounded-lg border border-[#e8e8e8] px-3 py-2.5">
          <label className="flex items-center gap-2 text-[13px] text-[#333]">
            <input
              type="checkbox"
              checked={visibility.home}
              onChange={(e) => onVisibilityChange({ ...visibility, home: e.target.checked })}
            />
            홈 화면
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#333]">
            <input
              type="checkbox"
              checked={visibility.newsEvent}
              onChange={(e) => onVisibilityChange({ ...visibility, newsEvent: e.target.checked })}
            />
            리뷰 이벤트 페이지
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={uploading || !data.content}
          className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white disabled:opacity-40"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function ProductPicker({
  data,
  onChange,
  products,
}: {
  data: Review;
  onChange: (v: Review) => void;
  products: ManagedProduct[];
}) {
  const matched = products.find((p) => p.name === data.product);
  const selectValue = matched ? `${matched.section}::${matched.name}` : MANUAL_PRODUCT;

  const bySection = new Map<string, ManagedProduct[]>();
  products.forEach((p) => {
    const label = SECTION_LABELS[p.section] ?? p.section;
    if (!bySection.has(label)) bySection.set(label, []);
    bySection.get(label)!.push(p);
  });

  return (
    <>
      <select
        value={selectValue}
        onChange={(e) => {
          if (e.target.value === MANUAL_PRODUCT) return;
          const name = e.target.value.split("::").slice(1).join("::");
          onChange({ ...data, product: name });
        }}
        className="h-10 w-full rounded-lg border border-[#e8e8e8] bg-white px-3 text-[13px] outline-none focus:border-[#c90f45]"
      >
        <option value={MANUAL_PRODUCT}>직접 입력</option>
        {Array.from(bySection.entries()).map(([label, items]) => (
          <optgroup key={label} label={label}>
            {items.map((p) => (
              <option key={p.id} value={`${p.section}::${p.name}`}>
                {p.name}{p.model ? ` (${p.model})` : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selectValue === MANUAL_PRODUCT && (
        <input
          value={data.product}
          onChange={(e) => onChange({ ...data, product: e.target.value })}
          placeholder="제품명을 직접 입력하세요"
          className="mt-2 h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
        />
      )}
    </>
  );
}
