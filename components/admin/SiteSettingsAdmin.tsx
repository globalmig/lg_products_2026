"use client";

import { useEffect, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import { adminStore } from "@/lib/adminStore";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "@/lib/siteDefaults";
import ConfirmDialog from "./ConfirmDialog";

type Section = "basic" | "consultBanner" | "privacy" | "terms";

interface FooterInfoItem {
  id: string;
  label: string;
  value: string;
}

export default function SiteSettingsAdmin() {
  const [activeSection, setActiveSection] = useState<Section>("basic");
  const [storeName, setStoreName] = useState("");

  const [privacyContent, setPrivacyContent] = useState(DEFAULT_PRIVACY);
  const [termsContent, setTermsContent] = useState(DEFAULT_TERMS);
  const [footerInfo, setFooterInfo] = useState<FooterInfoItem[]>([]);
  const [consultBanner, setConsultBanner] = useState({
    badge: "주주 상담",
    title: "지금 바로 상담을 신청하세요",
    desc: "전담 매니저가 빠르게 연락드립니다. 방문 없이 집에서 편리하게.",
    buttonText: "지금 바로 상담 예약",
    buttonHref: "/consult",
  });
  const [editingItem, setEditingItem] = useState<FooterInfoItem | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      setStoreName(s.storeName);
      if (s.privacyContent) setPrivacyContent(s.privacyContent);
      if (s.termsContent) setTermsContent(s.termsContent);
      setFooterInfo(s.footerInfo ?? []);
      if (s.consultBanner) setConsultBanner(s.consultBanner);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminStore.siteSettings.set({ storeName, privacyContent, termsContent, footerInfo, consultBanner });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    const item: FooterInfoItem = { id: Date.now().toString(), label: newLabel.trim(), value: newValue.trim() };
    setFooterInfo((prev) => [...prev, item]);
    setNewLabel("");
    setNewValue("");
  };

  const doDelete = () => {
    if (!confirmId) return;
    setFooterInfo((prev) => prev.filter((i) => i.id !== confirmId));
    setConfirmId(null);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    setFooterInfo((prev) => prev.map((i) => (i.id === editingItem.id ? editingItem : i)));
    setEditingItem(null);
  };

  const TABS: { id: Section; label: string }[] = [
    { id: "basic", label: "기본 정보" },
    { id: "consultBanner", label: "상담 배너" },
    { id: "privacy", label: "개인정보처리방침" },
    { id: "terms", label: "이용약관" },
  ];

  if (loading) return <AdminLoading />;

  return (
    <>
    <div className="max-w-2xl space-y-6">
      {/* 탭 */}
      <div className="flex border-b border-[#e8e8e8]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
            className={`relative flex-1 py-2.5 text-[13px] font-semibold transition-colors outline-none after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:transition-colors ${
              activeSection === id
                ? "text-[#c90f45] after:bg-[#c90f45]"
                : "text-[#aaa] after:bg-transparent hover:text-[#555]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* 기본 정보 + 사업자 정보 */}
        {activeSection === "basic" && (
          <>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">기본 정보</h2>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">매장명</label>
              <p className="mb-2 text-[11px] text-[#bbb]">헤더와 푸터 로고 옆에 표시됩니다.</p>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예: 용산전자상가점"
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
              />
            </div>

            <div className="border-t border-[#f0f0f0] pt-4">
              <h2 className="mb-1 text-[15px] font-bold text-[#1a1a1a]">사업자 정보</h2>
              <p className="mb-3 text-[11px] text-[#bbb]">푸터 하단에 표시됩니다. 항목을 추가·수정·삭제할 수 있습니다.</p>
              <div className="space-y-2">
                {footerInfo.length === 0 && (
                  <p className="text-[12px] text-[#ccc]">등록된 항목이 없습니다.</p>
                )}
                {footerInfo.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl border border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5">
                    {editingItem?.id === item.id ? (
                      <>
                        <input
                          value={editingItem.label}
                          onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                          placeholder="항목명"
                          className="h-8 w-24 rounded-lg border border-[#e8e8e8] px-2 text-[12px] outline-none focus:border-[#c90f45]"
                        />
                        <input
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                          placeholder="내용"
                          className="h-8 flex-1 rounded-lg border border-[#e8e8e8] px-2 text-[12px] outline-none focus:border-[#c90f45]"
                        />
                        <button type="button" onClick={saveEdit} className="h-8 rounded-lg bg-[#c90f45] px-3 text-[11px] font-bold text-white">완료</button>
                        <button type="button" onClick={() => setEditingItem(null)} className="h-8 rounded-lg bg-[#f0f0f0] px-3 text-[11px] text-[#555]">취소</button>
                      </>
                    ) : (
                      <>
                        <span className="w-24 text-[12px] font-semibold text-[#888]">{item.label}</span>
                        <span className="flex-1 text-[12px] text-[#333]">{item.value || <span className="text-[#ccc]">미입력</span>}</span>
                        <button type="button" onClick={() => setEditingItem({ ...item })} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#555] hover:bg-[#eee]" title="수정"><LuPencil size={13} /></button>
                        <button type="button" onClick={() => setConfirmId(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0f3] text-[#c90f45] hover:bg-[#ffe0e7]" title="삭제"><LuTrash2 size={13} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="항목명 (예: 대표자)"
                  className="h-9 w-28 rounded-xl border border-[#e8e8e8] px-2.5 text-[12px] outline-none focus:border-[#c90f45]"
                />
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="내용"
                  className="h-9 flex-1 rounded-xl border border-[#e8e8e8] px-2.5 text-[12px] outline-none focus:border-[#c90f45]"
                />
                <button type="button" onClick={addItem} className="h-9 rounded-xl bg-[#f5f5f5] px-4 text-[12px] font-semibold text-[#555] hover:bg-[#eee]">추가</button>
              </div>
            </div>
          </>
        )}

        {/* 상담 배너 */}
        {activeSection === "consultBanner" && (
          <>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">상담 배너</h2>
            <p className="text-[11px] text-[#bbb]">메인 페이지 하단의 상담 신청 배너 텍스트를 수정합니다.</p>
            {[
              { label: "배지 텍스트", key: "badge", placeholder: "예: 주주 상담" },
              { label: "제목", key: "title", placeholder: "예: 지금 바로 상담을 신청하세요" },
              { label: "설명", key: "desc", placeholder: "예: 전담 매니저가 빠르게 연락드립니다." },
              { label: "버튼 텍스트", key: "buttonText", placeholder: "예: 지금 바로 상담 예약" },
              { label: "버튼 링크", key: "buttonHref", placeholder: "예: /consult" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">{label}</label>
                <input
                  value={consultBanner[key as keyof typeof consultBanner]}
                  onChange={(e) => setConsultBanner((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
                />
              </div>
            ))}
          </>
        )}

        {/* 개인정보처리방침 */}
        {activeSection === "privacy" && (
          <>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">개인정보처리방침</h2>
            <p className="text-[11px] text-[#bbb]">푸터의 '개인정보 처리방침' 클릭 시 표시되는 내용입니다.</p>
            <textarea
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              rows={20}
              className="w-full resize-y rounded-xl border border-[#e8e8e8] px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-[#c90f45]"
            />
            <p className="text-right text-[11px] text-[#bbb]">{privacyContent.length} 자</p>
          </>
        )}

        {/* 이용약관 */}
        {activeSection === "terms" && (
          <>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">이용약관</h2>
            <p className="text-[11px] text-[#bbb]">푸터의 '이용약관' 클릭 시 표시되는 내용입니다.</p>
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={20}
              className="w-full resize-y rounded-xl border border-[#e8e8e8] px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-[#c90f45]"
            />
            <p className="text-right text-[11px] text-[#bbb]">{termsContent.length} 자</p>
          </>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-10 rounded-full bg-[#c90f45] px-6 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saved ? "저장됐습니다 ✓" : saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>

    {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
    </>
  );
}
