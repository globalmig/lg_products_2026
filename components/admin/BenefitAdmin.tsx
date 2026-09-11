"use client";

import { useEffect, useRef, useState } from "react";
import { LuTrash2, LuChevronUp, LuChevronDown } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import { adminStore, uploadImage, imageUrl, type BenefitContent, type BenefitItem } from "@/lib/adminStore";

const EMPTY: BenefitContent = { label: "", titleLine1: "", titleLine2: "", items: [] };

export default function BenefitAdmin() {
  const [benefit, setBenefit] = useState<BenefitContent>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      if (s.benefit) setBenefit(s.benefit);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminStore.siteSettings.set({ benefit });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (idx: number, patch: Partial<BenefitItem>) => {
    setBenefit((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  };

  const addItem = () => {
    setBenefit((prev) => ({ ...prev, items: [...prev.items, { icon: "", text: "" }] }));
  };

  const removeItem = (idx: number) => {
    setBenefit((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setBenefit((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.items.length) return prev;
      const items = [...prev.items];
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...prev, items };
    });
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">구독 혜택</h2>
          <p className="mt-0.5 text-[12px] text-[#aaa]">메인 페이지의 &quot;가전 구독하면 무엇이 좋은가요?&quot; 섹션 문구와 카드를 수정합니다.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saved ? "저장됨 ✓" : saving ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">상단 라벨</label>
          <input
            value={benefit.label}
            onChange={(e) => setBenefit((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="예: 가전 구독하면 무엇이 좋은가요?"
            className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">제목 1행</label>
          <input
            value={benefit.titleLine1}
            onChange={(e) => setBenefit((prev) => ({ ...prev, titleLine1: e.target.value }))}
            placeholder="예: 일시불과 차이없는 가격!"
            className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">제목 2행</label>
          <input
            value={benefit.titleLine2}
            onChange={(e) => setBenefit((prev) => ({ ...prev, titleLine2: e.target.value }))}
            placeholder="예: 부담은 지우고 전문가의 빈틈없는 케어를 남겨드립니다."
            className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-[13px] font-bold text-[#1a1a1a]">혜택 카드</h3>
        <p className="mb-3 text-[11px] text-[#bbb]">카드 텍스트는 줄바꿈해서 입력하면 화면에서도 줄바꿈되어 표시됩니다.</p>
        <div className="space-y-3">
          {benefit.items.length === 0 && (
            <p className="text-[12px] text-[#ccc]">등록된 카드가 없습니다.</p>
          )}
          {benefit.items.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#999]">카드 {idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#555] hover:bg-[#eee] disabled:opacity-30" title="위로">
                    <LuChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === benefit.items.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#555] hover:bg-[#eee] disabled:opacity-30" title="아래로">
                    <LuChevronDown size={14} />
                  </button>
                </div>
              </div>
              <IconImgUpload value={item.icon} onChange={(v) => updateItem(idx, { icon: v })} />
              <textarea
                value={item.text}
                onChange={(e) => updateItem(idx, { text: e.target.value })}
                rows={3}
                placeholder={"예: 전문가의\n방문관리"}
                className="w-full resize-y rounded-lg border border-[#e8e8e8] px-2.5 py-2 text-[12px] leading-relaxed outline-none focus:border-[#c90f45]"
              />
              <button type="button" onClick={() => removeItem(idx)} className="flex h-8 items-center rounded-lg bg-[#fff0f3] px-3 text-[11px] font-semibold text-[#c90f45] hover:bg-[#ffe0e7]">
                <LuTrash2 size={13} className="mr-1" /> 카드 삭제
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="mt-3 h-9 w-full rounded-xl bg-[#f5f5f5] text-[12px] font-semibold text-[#555] hover:bg-[#eee]">+ 혜택 카드 추가</button>
      </div>
    </div>
  );
}

function IconImgUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "benefit-icons");
      onChange(key);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
        {value
          ? <img src={imageUrl(value)} alt="" className="h-full w-full object-contain" />
          : <span className="text-[10px] text-[#ccc]">없음</span>}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-3 text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : value ? "이미지 변경" : "이미지 업로드"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="ml-2 text-[11px] text-[#bbb] hover:text-red-400">삭제</button>
        )}
        <p className="mt-1 text-[10px] text-[#bbb]">권장 사이즈: 160×138px (PNG)</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
