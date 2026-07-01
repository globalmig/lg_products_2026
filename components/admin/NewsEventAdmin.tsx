"use client";

import { useEffect, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import ConfirmDialog from "./ConfirmDialog";
import { ReviewForm } from "./ReviewAdmin";
import { adminStore, imageUrl, type NewsEventContent, type NewsEventStep, type NewsEventPrize, type Review } from "@/lib/adminStore";

const EMPTY_CONTENT: NewsEventContent = {
  badge: "",
  titleLine1: "",
  titleLine2: "",
  description: "",
  period: "",
  target: "",
  steps: [],
  prizes: [],
  prizeNote: "",
  reviews: [],
};

const EMPTY_REVIEW: Omit<Review, "id" | "sort_order"> = {
  stars: 5,
  image_key: "",
  content: "",
  name: "",
  product: "",
  date: "",
};

export default function NewsEventAdmin() {
  const [content, setContent] = useState<NewsEventContent>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [addingReview, setAddingReview] = useState<Omit<Review, "id" | "sort_order"> | null>(null);
  const [confirmReviewId, setConfirmReviewId] = useState<string | null>(null);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      if (s.newsEvent) setContent(s.newsEvent);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminStore.siteSettings.set({ newsEvent: content });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateStep = (i: number, patch: Partial<NewsEventStep>) => {
    setContent((prev) => ({ ...prev, steps: prev.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  };
  const addStep = () => setContent((prev) => ({ ...prev, steps: [...prev.steps, { title: "", desc: "" }] }));
  const removeStep = (i: number) => setContent((prev) => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));

  const updatePrize = (i: number, patch: Partial<NewsEventPrize>) => {
    setContent((prev) => ({ ...prev, prizes: prev.prizes.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  };
  const addPrize = () => setContent((prev) => ({ ...prev, prizes: [...prev.prizes, { rank: "", count: "", name: "", value: "", highlight: false }] }));
  const removePrize = (i: number) => setContent((prev) => ({ ...prev, prizes: prev.prizes.filter((_, idx) => idx !== i) }));

  const handleAddReview = () => {
    if (!addingReview) return;
    const newReview: Review = { id: `nr_${Date.now()}`, ...addingReview, sort_order: content.reviews.length };
    setContent((prev) => ({ ...prev, reviews: [...prev.reviews, newReview] }));
    setAddingReview(null);
  };

  const handleSaveReviewEdit = () => {
    if (!editingReview) return;
    setContent((prev) => ({ ...prev, reviews: prev.reviews.map((r) => (r.id === editingReview.id ? editingReview : r)) }));
    setEditingReview(null);
  };

  const handleDeleteReview = () => {
    if (!confirmReviewId) return;
    setContent((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== confirmReviewId) }));
    setConfirmReviewId(null);
  };

  if (loading) return <AdminLoading />;

  const inputCls = "h-9 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]";
  const labelCls = "mb-1 block text-[12px] font-semibold text-[#666]";

  return (
    <div className="max-w-2xl space-y-8">
      {confirmReviewId && <ConfirmDialog onConfirm={handleDeleteReview} onCancel={() => setConfirmReviewId(null)} />}

      <p className="text-[11px] text-[#bbb]">localhost:3000/news (리뷰 이벤트) 페이지의 내용을 수정합니다.</p>

      {/* 히어로 */}
      <div>
        <h3 className="mb-3 text-[14px] font-bold text-[#1a1a1a]">히어로 영역</h3>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>배지 문구</label>
            <input value={content.badge} onChange={(e) => setContent({ ...content, badge: e.target.value })} className={inputCls} placeholder="예: 2026년 6월 리뷰 이벤트" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>제목 1줄</label>
              <input value={content.titleLine1} onChange={(e) => setContent({ ...content, titleLine1: e.target.value })} className={inputCls} placeholder="예: 후기 남기고" />
            </div>
            <div>
              <label className={labelCls}>제목 2줄 (강조)</label>
              <input value={content.titleLine2} onChange={(e) => setContent({ ...content, titleLine2: e.target.value })} className={inputCls} placeholder="예: 경품 받아가세요" />
            </div>
          </div>
          <div>
            <label className={labelCls}>설명</label>
            <textarea value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} rows={2} className="w-full resize-none rounded-lg border border-[#e8e8e8] px-3 py-2 text-[13px] outline-none focus:border-[#c90f45]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>이벤트 기간</label>
              <input value={content.period} onChange={(e) => setContent({ ...content, period: e.target.value })} className={inputCls} placeholder="예: 2026.06.01 – 06.30" />
            </div>
            <div>
              <label className={labelCls}>대상</label>
              <input value={content.target} onChange={(e) => setContent({ ...content, target: e.target.value })} className={inputCls} placeholder="예: 구독·구매 완료 고객" />
            </div>
          </div>
        </div>
      </div>

      {/* 참여 방법 (STEP) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#1a1a1a]">참여 방법 (STEP)</h3>
          <button type="button" onClick={addStep} className="text-[12px] font-semibold text-[#c90f45] hover:underline">+ STEP 추가</button>
        </div>
        <div className="space-y-3">
          {content.steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#999]">STEP {String(i + 1).padStart(2, "0")}</span>
                <button type="button" onClick={() => removeStep(i)} className="text-[11px] text-[#bbb] hover:text-red-400">삭제</button>
              </div>
              <input value={step.title} onChange={(e) => updateStep(i, { title: e.target.value })} placeholder="제목" className={`${inputCls} mb-2 bg-white`} />
              <textarea value={step.desc} onChange={(e) => updateStep(i, { desc: e.target.value })} rows={2} placeholder="설명" className="w-full resize-none rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#c90f45]" />
            </div>
          ))}
          {content.steps.length === 0 && <p className="text-[12px] text-[#ccc]">등록된 STEP이 없습니다.</p>}
        </div>
      </div>

      {/* 경품 안내 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#1a1a1a]">경품 안내</h3>
          <button type="button" onClick={addPrize} className="text-[12px] font-semibold text-[#c90f45] hover:underline">+ 경품 추가</button>
        </div>
        <div className="space-y-3">
          {content.prizes.map((prize, i) => (
            <div key={i} className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[12px] text-[#555]">
                  <input type="checkbox" checked={prize.highlight} onChange={(e) => updatePrize(i, { highlight: e.target.checked })} />
                  강조 표시 (1등 스타일)
                </label>
                <button type="button" onClick={() => removePrize(i)} className="text-[11px] text-[#bbb] hover:text-red-400">삭제</button>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <input value={prize.rank} onChange={(e) => updatePrize(i, { rank: e.target.value })} placeholder="순위 (예: 1등)" className={`${inputCls} bg-white`} />
                <input value={prize.count} onChange={(e) => updatePrize(i, { count: e.target.value })} placeholder="인원 (예: 매월 2명)" className={`${inputCls} bg-white`} />
              </div>
              <textarea
                value={prize.name}
                onChange={(e) => updatePrize(i, { name: e.target.value })}
                rows={2}
                placeholder={"경품명 (줄바꿈 가능)"}
                className="mb-2 w-full resize-none rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#c90f45]"
              />
              <input value={prize.value} onChange={(e) => updatePrize(i, { value: e.target.value })} placeholder="가치 (예: 60,000원 상당)" className={`${inputCls} bg-white`} />
            </div>
          ))}
          {content.prizes.length === 0 && <p className="text-[12px] text-[#ccc]">등록된 경품이 없습니다.</p>}
        </div>
        <div className="mt-3">
          <label className={labelCls}>경품 하단 안내 문구</label>
          <input value={content.prizeNote} onChange={(e) => setContent({ ...content, prizeNote: e.target.value })} className={inputCls} placeholder="예: ※ 당첨자 발표는 매월 초 개별 문자 발송" />
        </div>
      </div>

      {/* 고객 생생 후기 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#1a1a1a]">고객 생생 후기</h3>
          <button type="button" onClick={() => setAddingReview(EMPTY_REVIEW)} className="text-[12px] font-semibold text-[#c90f45] hover:underline">+ 후기 추가</button>
        </div>

        {content.reviews.length === 0 && <p className="text-[12px] text-[#ccc]">등록된 후기가 없습니다.</p>}

        <div className="space-y-3">
          {content.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3">
              {editingReview?.id === review.id ? (
                <ReviewForm
                  data={editingReview}
                  onChange={setEditingReview as (v: Review) => void}
                  onSave={handleSaveReviewEdit}
                  onCancel={() => setEditingReview(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex gap-0.5">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <span key={i} className="text-[13px] text-[#f5a623]">★</span>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-[13px] text-[#555]">{review.content}</p>
                    <p className="mt-1 text-[12px] font-bold text-[#1a1a1a]">{review.name}</p>
                    <p className="text-[11px] text-[#999]">{review.product} · {review.date}</p>
                  </div>
                  {review.image_key && <img src={imageUrl(review.image_key)} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover bg-white" />}
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setEditingReview({ ...review })} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]" title="수정"><LuPencil size={13} /></button>
                    <button onClick={() => setConfirmReviewId(review.id)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-red-400 hover:text-red-500" title="삭제"><LuTrash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {addingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAddingReview(null)} />
            <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6">
              <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">후기 추가</h3>
              <ReviewForm
                data={{ id: "", ...addingReview, sort_order: 0 }}
                onChange={(v) => setAddingReview({ stars: v.stars, image_key: v.image_key, content: v.content, name: v.name, product: v.product, date: v.date })}
                onSave={handleAddReview}
                onCancel={() => setAddingReview(null)}
                saveLabel="추가"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-[#f0f0f0] pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-10 items-center rounded-full bg-[#c90f45] px-6 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-[12px] font-semibold text-[#2ba84a]">저장되었습니다.</span>}
      </div>
    </div>
  );
}
