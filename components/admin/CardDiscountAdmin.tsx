"use client";

import { useState, useEffect, useRef } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import Image from "next/image";
import { adminStore, imageUrl, uploadImage, type CardDiscount } from "@/lib/adminStore";
import { CARD_DETAIL_DEFAULTS, type CardDetailJson, type CardTier } from "@/data/cardData";

const EMPTY: Omit<CardDiscount, "id"> = { name: "", discount: 0, image_key: "", sort_order: 0 };

function buildDetailJson(form: DetailForm): CardDetailJson {
  return {
    fullName: form.fullName || undefined,
    company: form.company || undefined,
    label: form.label || undefined,
    minSpend: form.minSpend || undefined,
    maxDiscount: form.maxDiscount || undefined,
    benefitPeriod: form.benefitPeriod || undefined,
    officialUrl: form.officialUrl || undefined,
    annualFee: {
      domestic: form.annualFeeDomestic,
      overseas: form.annualFeeOverseas || undefined,
      brand: form.annualFeeBrand || undefined,
      overseasLabel: form.annualFeeOverseasLabel || undefined,
    },
    tiers: form.tiers.filter((t) => t.spend.trim()),
    notes: form.notesText.split("\n").map((n) => n.trim()).filter(Boolean),
    detail: (() => {
      try { return form.detailJson ? JSON.parse(form.detailJson) : undefined; } catch { return undefined; }
    })(),
  };
}

interface DetailForm {
  fullName: string;
  company: string;
  label: string;
  minSpend: string;
  maxDiscount: string;
  benefitPeriod: string;
  officialUrl: string;
  annualFeeDomestic: string;
  annualFeeOverseas: string;
  annualFeeBrand: string;
  annualFeeOverseasLabel: string;
  tiers: Array<{ spend: string; discount: string; note: string }>;
  notesText: string;
  detailJson: string;
}

function initDetailForm(card: CardDiscount | null, cardId: string): DetailForm {
  let parsed: CardDetailJson | null = null;
  if (card?.card_detail_json) {
    try { parsed = JSON.parse(card.card_detail_json); } catch {}
  }
  const defaults = CARD_DETAIL_DEFAULTS[cardId] ?? {};
  const src = parsed ?? defaults;
  return {
    fullName: src.fullName ?? "",
    company: src.company ?? "",
    label: src.label ?? "",
    minSpend: src.minSpend ?? "",
    maxDiscount: src.maxDiscount ?? "",
    benefitPeriod: src.benefitPeriod ?? "",
    officialUrl: src.officialUrl ?? "",
    annualFeeDomestic: src.annualFee?.domestic ?? "",
    annualFeeOverseas: src.annualFee?.overseas ?? "",
    annualFeeBrand: src.annualFee?.brand ?? "",
    annualFeeOverseasLabel: src.annualFee?.overseasLabel ?? "",
    tiers: (src.tiers ?? []).map((t) => ({ spend: t.spend, discount: t.discount, note: t.note ?? "" })),
    notesText: (src.notes ?? []).join("\n"),
    detailJson: src.detail ? JSON.stringify(src.detail, null, 2) : "",
  };
}

function CardModal({
  initial,
  maxOrder,
  onSave,
  onClose,
}: {
  initial: CardDiscount | null;
  maxOrder: number;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<CardDiscount, "id">>(
    initial
      ? { name: initial.name, discount: initial.discount, image_key: initial.image_key, sort_order: initial.sort_order }
      : { ...EMPTY, sort_order: maxOrder }
  );
  const [preview, setPreview] = useState(initial?.image_key ? imageUrl(initial.image_key) : "");
  const [saving, setSaving] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [detailForm, setDetailForm] = useState<DetailForm>(() =>
    initDetailForm(initial, initial?.id ?? "")
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setDetail = <K extends keyof DetailForm>(k: K, v: DetailForm[K]) =>
    setDetailForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTier = () =>
    setDetailForm((f) => ({ ...f, tiers: [...f.tiers, { spend: "", discount: "", note: "" }] }));

  const removeTier = (i: number) =>
    setDetailForm((f) => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) }));

  const setTier = (i: number, k: keyof CardTier, v: string) =>
    setDetailForm((f) => {
      const tiers = [...f.tiers];
      tiers[i] = { ...tiers[i], [k]: v };
      return { ...f, tiers };
    });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let image_key = form.image_key;
      if (fileRef.current?.files?.[0]) {
        image_key = await uploadImage(fileRef.current.files[0], "cards");
      }
      const card_detail_json = JSON.stringify(buildDetailJson(detailForm));
      const data = { ...form, image_key, card_detail_json };
      if (initial) {
        await adminStore.cardDiscounts.update(initial.id, data);
      } else {
        await adminStore.cardDiscounts.add({ id: `card_${Date.now()}`, ...data });
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]";
  const labelCls = "mb-1 block text-[12px] font-semibold text-[#555]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4 shrink-0">
          <h3 className="text-[16px] font-bold">{initial ? "카드 수정" : "카드 추가"}</h3>
          <button type="button" onClick={onClose} className="text-[20px] text-[#999] hover:text-[#333]">✕</button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* 기본 정보 */}
          <div className="space-y-4">
            {/* 카드 이미지 */}
            <div>
              <label className={labelCls}>카드 이미지 <span className="font-normal text-[#aaa]">(선택)</span></label>
              <p className="mb-1.5 text-[11px] text-[#bbb]">권장: 400 × 640px · JPG/PNG · 세로형 카드 비율</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors"
              >
                {preview ? (
                  <div className="relative h-14 w-24">
                    <Image src={preview} alt="카드 미리보기" fill className="object-contain rounded" unoptimized />
                  </div>
                ) : (
                  <span className="text-[12px] text-[#aaa]">클릭하거나 드래그하여 첨부</span>
                )}
              </div>
              {preview && (
                <button type="button"
                  onClick={() => { setPreview(""); set("image_key", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="mt-1.5 text-[11px] text-[#bbb] hover:text-[#c90f45]">이미지 삭제</button>
              )}
            </div>

            {/* 카드명 */}
            <div>
              <label className={labelCls}>카드명 <span className="font-normal text-[#aaa]">(관리자 표시용)</span></label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className={inputCls} placeholder="예: [LG전자] 우리 Platinum" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>월 최대 할인금액 (원)</label>
                <input type="number" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))}
                  className={inputCls} placeholder="예: 42000" />
              </div>
              <div>
                <label className={labelCls}>표시 순서</label>
                <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
                  className={inputCls} />
              </div>
            </div>
          </div>

          {/* 카드 상세 정보 섹션 */}
          <div className="rounded-xl border border-[#e8e8e8]">
            <button
              type="button"
              onClick={() => setDetailExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#fafafa] rounded-xl"
            >
              <span>카드 상세 정보 <span className="font-normal text-[#888]">(구독 페이지 표시 내용)</span></span>
              <span className="text-[11px] text-[#999]">{detailExpanded ? "▲ 접기" : "▼ 펼치기"}</span>
            </button>

            {detailExpanded && (
              <div className="border-t border-[#f0f0f0] px-4 py-4 space-y-5">

                {/* 기본 카드 정보 */}
                <div>
                  <p className="mb-3 text-[11px] font-bold text-[#999] uppercase tracking-wide">기본 정보</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>카드사명</label>
                        <input value={detailForm.company} onChange={(e) => setDetail("company", e.target.value)}
                          className={inputCls} placeholder="예: 신한카드" />
                      </div>
                      <div>
                        <label className={labelCls}>라벨 <span className="font-normal text-[#aaa]">(선택)</span></label>
                        <input value={detailForm.label} onChange={(e) => setDetail("label", e.target.value)}
                          className={inputCls} placeholder="예: Platinum" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>카드 전체명</label>
                      <input value={detailForm.fullName} onChange={(e) => setDetail("fullName", e.target.value)}
                        className={inputCls} placeholder="예: [신한] LG전자 The 구독케어 신한카드" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>최대 할인 표시 <span className="font-normal text-[#aaa]">(텍스트)</span></label>
                        <input value={detailForm.maxDiscount} onChange={(e) => setDetail("maxDiscount", e.target.value)}
                          className={inputCls} placeholder="예: 30,000원" />
                      </div>
                      <div>
                        <label className={labelCls}>최소 실적 조건</label>
                        <input value={detailForm.minSpend} onChange={(e) => setDetail("minSpend", e.target.value)}
                          className={inputCls} placeholder="예: 130만원 이상" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>혜택 기간</label>
                      <input value={detailForm.benefitPeriod} onChange={(e) => setDetail("benefitPeriod", e.target.value)}
                        className={inputCls} placeholder="예: 2026.05.01~2026.05.31" />
                    </div>
                    <div>
                      <label className={labelCls}>카드 공식 사이트 링크 <span className="font-normal text-[#aaa]">("카드 정보 자세히 보기" 버튼에 연결됩니다)</span></label>
                      <input value={detailForm.officialUrl} onChange={(e) => setDetail("officialUrl", e.target.value)}
                        className={inputCls} placeholder="예: https://www.shinhancard.com" />
                    </div>
                  </div>
                </div>

                {/* 연회비 */}
                <div>
                  <p className="mb-3 text-[11px] font-bold text-[#999] uppercase tracking-wide">연회비</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>국내전용</label>
                      <input value={detailForm.annualFeeDomestic} onChange={(e) => setDetail("annualFeeDomestic", e.target.value)}
                        className={inputCls} placeholder="예: 22,000원" />
                    </div>
                    <div>
                      <label className={labelCls}>해외겸용</label>
                      <input value={detailForm.annualFeeOverseas} onChange={(e) => setDetail("annualFeeOverseas", e.target.value)}
                        className={inputCls} placeholder="예: 25,000원" />
                    </div>
                    <div>
                      <label className={labelCls}>브랜드</label>
                      <input value={detailForm.annualFeeBrand} onChange={(e) => setDetail("annualFeeBrand", e.target.value)}
                        className={inputCls} placeholder="예: Mastercard" />
                    </div>
                    <div>
                      <label className={labelCls}>해외겸용 라벨</label>
                      <input value={detailForm.annualFeeOverseasLabel} onChange={(e) => setDetail("annualFeeOverseasLabel", e.target.value)}
                        className={inputCls} placeholder="기본값: 해외겸용" />
                    </div>
                  </div>
                </div>

                {/* 할인 단계 */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#999] uppercase tracking-wide">할인 단계</p>
                    <button type="button" onClick={addTier}
                      className="rounded-full border border-[#e0e0e0] px-3 py-1 text-[11px] font-semibold text-[#555] hover:border-[#999]">
                      + 단계 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {detailForm.tiers.map((tier, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-xl bg-[#fafafa] p-3">
                        <div className="flex-1 space-y-2">
                          <input value={tier.spend} onChange={(e) => setTier(i, "spend", e.target.value)}
                            className={inputCls} placeholder="실적 조건 (예: 30만원 이상 사용 시)" />
                          <input value={tier.discount} onChange={(e) => setTier(i, "discount", e.target.value)}
                            className={inputCls} placeholder="할인 내용 (예: 월 최대 17,000원 할인)" />
                          <input value={tier.note} onChange={(e) => setTier(i, "note", e.target.value)}
                            className={inputCls} placeholder="비고 (선택)" />
                        </div>
                        <button type="button" onClick={() => removeTier(i)}
                          className="mt-1 text-[16px] text-[#ccc] hover:text-[#c90f45]">✕</button>
                      </div>
                    ))}
                    {detailForm.tiers.length === 0 && (
                      <p className="text-[12px] text-[#ccc] text-center py-2">단계가 없습니다. + 단계 추가를 눌러주세요.</p>
                    )}
                  </div>
                </div>

                {/* 유의사항 */}
                <div>
                  <label className={labelCls}>유의사항 <span className="font-normal text-[#aaa]">(줄바꿈으로 구분)</span></label>
                  <textarea
                    value={detailForm.notesText}
                    onChange={(e) => setDetail("notesText", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 text-[12px] outline-none focus:border-[#c90f45] resize-y leading-[1.6]"
                    placeholder={"첫 번째 유의사항\n두 번째 유의사항\n세 번째 유의사항"}
                  />
                </div>

                {/* 상세 테이블 (JSON) */}
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <label className={labelCls + " mb-0"}>상세 테이블 설정</label>
                    <span className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-[10px] text-[#888]">JSON</span>
                  </div>
                  <p className="mb-1.5 text-[11px] text-[#bbb]">
                    tableStyle: &quot;basic&quot; | &quot;simple&quot; | &quot;full&quot; · tableRows, tableNotes, excludedItems 등 포함
                  </p>
                  <textarea
                    value={detailForm.detailJson}
                    onChange={(e) => setDetail("detailJson", e.target.value)}
                    rows={10}
                    className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 text-[11px] font-mono outline-none focus:border-[#c90f45] resize-y"
                    placeholder={'{\n  "tableStyle": "simple",\n  "tableRows": [...],\n  "tableNotes": [...]\n}'}
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-[#f0f0f0] px-6 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 rounded-full border border-[#e0e0e0] text-[13px] font-semibold text-[#555] hover:bg-[#f5f5f5]">
            취소
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-full bg-[#c90f45] text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardDiscountAdmin() {
  const [cards, setCards] = useState<CardDiscount[]>([]);
  const [modal, setModal] = useState<CardDiscount | null | "new">(undefined as unknown as null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CardDiscount | null>(null);
  const load = async () => setCards(await adminStore.cardDiscounts.get());

  useEffect(() => { load(); }, []);

  const openNew = () => { setModal(null); setShowModal(true); };
  const openEdit = (c: CardDiscount) => { setModal(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModal(null); };

  const handleDelete = async (card: CardDiscount) => {
    await adminStore.cardDiscounts.delete(card.id);
    load();
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">제휴카드 할인 관리</h2>
          <p className="mt-0.5 text-[13px] text-[#888]">제휴카드 혜택 페이지 및 상품 상세 페이지에 표시되는 카드 목록을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
<button type="button" onClick={openNew}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#c90f45] px-4 text-[13px] font-bold text-white hover:opacity-90">
            + 카드 추가
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fafafa] text-[#888]">
              <th className="px-4 py-3 text-left font-semibold">순서</th>
              <th className="px-4 py-3 text-left font-semibold">이미지</th>
              <th className="px-4 py-3 text-left font-semibold">카드명</th>
              <th className="px-4 py-3 text-right font-semibold">월 최대 할인</th>
              <th className="px-4 py-3 text-right font-semibold">상세</th>
              <th className="px-4 py-3 text-right font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                <td className="px-4 py-3 text-[#aaa]">{card.sort_order}</td>
                <td className="px-4 py-3">
                  {card.image_key ? (
                    <div className="relative h-8 w-14">
                      <Image src={imageUrl(card.image_key)} alt={card.name} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#ccc]">없음</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-[#1a1a1a]">{card.name}</td>
                <td className="px-4 py-3 text-right font-bold text-[#c90f45]">
                  -{card.discount.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-right">
                  {card.card_detail_json ? (
                    <span className="rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-semibold text-[#1a7a3a]">편집됨</span>
                  ) : (
                    <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[11px] text-[#aaa]">기본값</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(card)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e0e0e0] text-[#555] hover:border-[#999]" title="수정"><LuPencil size={13} /></button>
                    <button type="button" onClick={() => setDeleteTarget(card)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ffdde5] text-[#c90f45] hover:bg-[#fff0f3]" title="삭제"><LuTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px] text-[#bbb]">등록된 카드가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CardModal
          initial={modal as CardDiscount | null}
          maxOrder={cards.length}
          onSave={() => { load(); closeModal(); }}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="mb-1 text-[16px] font-bold text-[#1a1a1a]">카드를 삭제하시겠어요?</p>
            <p className="mb-6 text-[13px] text-[#888]">{deleteTarget.name}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-full border border-[#e0e0e0] text-[13px] font-semibold text-[#555]">취소</button>
              <button type="button" onClick={() => handleDelete(deleteTarget)}
                className="flex-1 h-10 rounded-full bg-[#c90f45] text-[13px] font-bold text-white">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
