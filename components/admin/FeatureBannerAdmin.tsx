"use client";

import { useEffect, useRef, useState } from "react";
import { adminStore, uploadImage, imageUrl, type FeatureBanner } from "@/lib/adminStore";

const DEFAULT: FeatureBanner = {
  image_key: "",
  subtitle: "말로 해서 더 편리한 정수기",
  title: "LG PuriCare | Objet Collection",
  button_label: "제품 페이지 바로가기",
  href: "/products/kitchen",
};

export default function FeatureBannerAdmin() {
  const [form, setForm] = useState<FeatureBanner>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminStore.featureBanner.get().then((data) => {
      if (data) setForm(data);
    });
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "banners");
      setForm((f) => ({ ...f, image_key: key }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    await adminStore.featureBanner.set(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    if (!confirm("기본값으로 초기화하시겠습니까?")) return;
    setForm(DEFAULT);
    await adminStore.featureBanner.set(DEFAULT);
  };

  const previewImage = imageUrl(form.image_key);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-black text-[#1a1a1a]">피처 배너 관리</h2>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666] hover:border-red-300 hover:text-red-500">
            초기화
          </button>
          <button onClick={handleSave}
            className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">
            {saved ? "저장됨 ✓" : "저장"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <Field label="배경 이미지">
            <div onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-[#e8e8e8] transition-colors hover:border-[#c90f45]"
              style={{ minHeight: "120px" }}>
              {uploading ? (
                <p className="text-[13px] text-[#aaa]">업로드 중...</p>
              ) : previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt="" className="max-h-44 w-full object-cover" />
              ) : (
                <>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className="text-[12px] text-[#aaa]">클릭해서 이미지 업로드</p>
                </>
              )}
              {previewImage && !uploading && <p className="py-1 text-[11px] text-[#aaa]">클릭해서 이미지 변경</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <p className="mt-1.5 text-[11px] text-[#bbb]">권장: 1920×860px 이상 · JPG, PNG, WebP</p>
          </Field>

          <Field label="부제목 (작은 텍스트)">
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
              placeholder="예) 말로 해서 더 편리한 정수기" />
          </Field>

          <Field label="메인 제목">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
              placeholder="예) LG PuriCare | Objet Collection" />
          </Field>

          <Field label="버튼 텍스트">
            <input value={form.button_label} onChange={(e) => setForm((f) => ({ ...f, button_label: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
              placeholder="예) 제품 페이지 바로가기" />
          </Field>

          <Field label="버튼 링크 URL">
            <input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
              placeholder="예) /products/kitchen 또는 https://..." />
            <p className="mt-1 text-[11px] text-[#bbb]">내부 경로(/products/...) 또는 외부 URL(https://...) 모두 가능</p>
          </Field>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-[12px] font-semibold text-[#666]">미리보기</p>
          <div className="relative overflow-hidden rounded-xl" style={{ minHeight: "200px" }}>
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            ) : (
              <div className="absolute inset-0 bg-linear-to-r from-[#e8e8e8] to-[#d0d0d0]" />
            )}
            <div className="relative z-10 flex h-full min-h-50 flex-col justify-center px-8 py-10">
              <p className="mb-1 text-[12px] font-medium text-[#333]">{form.subtitle || "부제목"}</p>
              <h2 className="mb-4 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">
                {form.title || "메인 제목"}
              </h2>
              <span className="inline-flex w-fit items-center rounded-full bg-white/70 px-5 py-2 text-[12px] font-semibold text-[#1a1a1a] backdrop-blur-sm">
                {form.button_label || "버튼 텍스트"}
              </span>
            </div>
          </div>
        </div>
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
