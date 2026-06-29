"use client";

import { useEffect, useState } from "react";
import { adminStore } from "@/lib/adminStore";

export default function SiteSettingsAdmin() {
  const [storeName, setStoreName] = useState("");
  const [copyright, setCopyright] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminStore.siteSettings.get().then((s) => {
      setStoreName(s.storeName);
      setCopyright(s.copyright);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminStore.siteSettings.set({ storeName, copyright });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-[#1a1a1a]">헤더 / 푸터 설정</h2>

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

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[#555]">저작권 문구</label>
          <p className="mb-2 text-[11px] text-[#bbb]">푸터 하단에 표시됩니다.</p>
          <input
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            placeholder="© 2025 LG Electronics Inc. All rights reserved."
            className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
        </div>

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
  );
}
