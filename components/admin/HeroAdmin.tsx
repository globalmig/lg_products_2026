"use client";

import { useEffect, useRef, useState } from "react";
import { adminStore, uploadImage, imageUrl } from "@/lib/adminStore";
import type { Slide } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

type SlideWithKey = Slide & { image_key: string };

const EMPTY = { image: "", image_key: "", subtitle: "", title: "" };

export default function HeroAdmin() {
  const [slides, setSlides] = useState<SlideWithKey[]>([]);
  const [editing, setEditing] = useState<SlideWithKey | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    adminStore.slides.get().then(async (data) => {
      if (data.length > 0) {
        setSlides(data);
      } else {
        const defaults = [
          { image_key: "/images/main/hero.jpg",  subtitle: "", title: "", sort_order: 0 },
          { image_key: "/images/main/hero2.jpg", subtitle: "", title: "", sort_order: 1 },
        ];
        await Promise.all(defaults.map((s) => adminStore.slides.add(s)));
        const fresh = await adminStore.slides.get();
        setSlides(fresh);
      }
    });
  }, []);

  const handleSaveEdit = async () => {
    if (!editing) return;
    await adminStore.slides.update(editing.id, {
      image_key: editing.image_key,
      subtitle: editing.subtitle,
      title: editing.title,
      sort_order: slides.findIndex((s) => s.id === editing.id),
    });
    setSlides((prev) => prev.map((s) => (s.id === editing.id ? editing : s)));
    setEditing(null);
  };

  const handleAdd = async () => {
    const result = await adminStore.slides.add({
      image_key: form.image_key,
      subtitle: form.subtitle,
      title: form.title,
      sort_order: slides.length,
    });
    const { id } = result as { id: number };
    setSlides((prev) => [...prev, { id, image: form.image, image_key: form.image_key, subtitle: form.subtitle, title: form.title }]);
    setForm(EMPTY);
    setAdding(false);
  };

  const handleDelete = (id: number) => setConfirmId(id);

  const doDelete = async () => {
    if (confirmId === null) return;
    await adminStore.slides.delete(confirmId);
    setSlides((prev) => prev.filter((s) => s.id !== confirmId));
    setConfirmId(null);
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= slides.length) return;
    const next = [...slides];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setSlides(next);
    await Promise.all([
      adminStore.slides.update(next[idx].id, { image_key: next[idx].image_key, subtitle: next[idx].subtitle, title: next[idx].title, sort_order: idx }),
      adminStore.slides.update(next[swapIdx].id, { image_key: next[swapIdx].image_key, subtitle: next[swapIdx].subtitle, title: next[swapIdx].title, sort_order: swapIdx }),
    ]);
  };

  return (
    <div>
      {confirmId !== null && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-black text-[#1a1a1a]">히어로 슬라이드 관리</h2>
        <button onClick={() => setAdding(true)} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">
          + 슬라이드 추가
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="rounded-2xl bg-white p-5 shadow-sm">
            {editing?.id === slide.id ? (
              <SlideForm data={editing} onChange={setEditing as (v: typeof editing) => void} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button type="button" onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => handleMove(idx, 1)} disabled={idx === slides.length - 1} className="h-4 text-[10px] text-[#bbb] hover:text-[#555] disabled:opacity-30">▼</button>
                </div>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {slide.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.image} alt="" className="h-14 w-24 shrink-0 rounded-lg object-contain bg-[#f5f5f5]" />
                  ) : (
                    <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] text-[11px] text-[#bbb]">이미지 없음</div>
                  )}
                  <div className="min-w-0">
                    <p className="mb-0.5 text-[11px] text-[#aaa]">슬라이드 {slide.id}</p>
                    <p className="text-[13px] text-[#888]">{slide.subtitle}</p>
                    <p className="text-[15px] font-black text-[#1a1a1a]">{slide.title.replace(/\n/g, " / ")}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setEditing({ ...slide })} className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]">수정</button>
                  <button onClick={() => handleDelete(slide.id)} className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-red-400 hover:text-red-500">삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <Modal title="슬라이드 추가" onClose={() => setAdding(false)}>
          <SlideForm data={{ id: 0, ...form }} onChange={(v) => setForm({ image: v.image, image_key: v.image_key, subtitle: v.subtitle, title: v.title })} onSave={handleAdd} onCancel={() => setAdding(false)} saveLabel="추가" />
        </Modal>
      )}
    </div>
  );
}

function SlideForm({ data, onChange, onSave, onCancel, saveLabel = "저장" }: {
  data: SlideWithKey;
  onChange: (v: SlideWithKey) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "slides");
      onChange({ ...data, image_key: key, image: imageUrl(key) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Field label="이미지">
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-5 hover:border-[#c90f45] transition-colors"
        >
          {uploading ? (
            <p className="text-[13px] text-[#aaa]">업로드 중...</p>
          ) : data.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" className="max-h-32 w-full rounded-lg object-contain" />
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-[12px] text-[#aaa]">클릭해서 이미지 업로드</p>
            </>
          )}
          {data.image && !uploading && <p className="text-[11px] text-[#aaa]">클릭해서 이미지 변경</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <p className="mt-1.5 text-[11px] text-[#bbb]">권장 크기: 1920×1080px 이상 · 최대 5MB (JPG, PNG, WebP)</p>
      </Field>
      <Field label="부제목">
        <input value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]" />
      </Field>
      <Field label="제목 (줄바꿈: \n)">
        <textarea value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} rows={2}
          className="w-full resize-none rounded-lg border border-[#e8e8e8] px-3 py-2 text-[13px] outline-none focus:border-[#c90f45]" />
      </Field>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={uploading} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white disabled:opacity-50">{saveLabel}</button>
        <button onClick={onCancel} className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]">취소</button>
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 mx-4">
        <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">{title}</h3>
        {children}
      </div>
    </div>
  );
}
