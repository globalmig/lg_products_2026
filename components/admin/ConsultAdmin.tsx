"use client";

import { useEffect, useState } from "react";
import { adminStore, type ConsultSubmission } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

const STATUS = {
  new: { label: "신규", cls: "bg-blue-50 text-blue-600 border-blue-200" },
  inProgress: { label: "진행중", cls: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  completed: { label: "완료", cls: "bg-green-50 text-green-600 border-green-200" },
} as const;

function exportCSV(submissions: ConsultSubmission[]) {
  const headers = ["이름", "연락처", "상태", "신청일시", "목적/선택제품", "지역", "아파트", "채널", "모델", "관할타임", "상담가능시간", "추가내용", "메모"];
  const rows = submissions.map((s) => [
    s.name,
    s.phone,
    STATUS[s.status].label,
    new Date(s.submitted_at).toLocaleString("ko-KR"),
    s.selectedProducts?.length
      ? s.selectedProducts.map((p) => `${p.name}(${p.model})`).join(" | ")
      : s.purpose ?? "",
    s.area ?? "",
    s.apartment ?? "",
    (s.channels ?? []).join(" | "),
    s.model ?? "",
    s.careType ?? "",
    s.availableTime ?? "",
    s.extra ?? "",
    s.memo ?? "",
  ]);

  const BOM = "﻿";
  const csv = BOM + [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `상담신청_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConsultAdmin() {
  const [submissions, setSubmissions] = useState<ConsultSubmission[]>([]);
  const [selected, setSelected] = useState<ConsultSubmission | null>(null);
  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoSaved, setMemoSaved] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    adminStore.consult.get().then(setSubmissions);
  }, []);

  const openDetail = (sub: ConsultSubmission) => {
    setSelected(sub);
    setMemo(sub.memo ?? "");
    setMemoSaved(false);
  };

  const updateStatus = async (id: string, status: ConsultSubmission["status"]) => {
    await adminStore.consult.updateStatus(id, status);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (selected?.id === id) setSelected((prev) => prev && { ...prev, status });
  };

  const saveMemo = async () => {
    if (!selected) return;
    setMemoSaving(true);
    await adminStore.consult.updateMemo(selected.id, memo);
    setSubmissions((prev) => prev.map((s) => (s.id === selected.id ? { ...s, memo } : s)));
    setSelected((prev) => prev && { ...prev, memo });
    setMemoSaving(false);
    setMemoSaved(true);
    setTimeout(() => setMemoSaved(false), 2000);
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.consult.delete(confirmId);
    setSubmissions((prev) => prev.filter((s) => s.id !== confirmId));
    if (selected?.id === confirmId) setSelected(null);
    setConfirmId(null);
  };

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">상담 신청 현황</h2>
          <p className="text-[13px] text-[#888]">총 {submissions.length}건 · 신규 {submissions.filter((s) => s.status === "new").length}건</p>
        </div>
        <button
          onClick={() => exportCSV(submissions)}
          disabled={submissions.length === 0}
          className="flex items-center gap-1.5 h-9 rounded-full border border-[#e8e8e8] bg-white px-4 text-[13px] font-semibold text-[#555] hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          엑셀 다운로드
        </button>
      </div>

      {/* 목록 */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl bg-white py-20 text-center text-[14px] text-[#aaa] shadow-sm">접수된 상담 신청이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} onClick={() => openDetail(sub)}
              className="flex cursor-pointer items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#1a1a1a]">
                  {sub.name}
                  <span className="ml-2 font-normal text-[#888] text-[13px]">{sub.phone}</span>
                </p>
                <p className="text-[13px] text-[#888]">
                  {sub.selectedProducts?.length
                    ? `${sub.selectedProducts.length}개 제품 · ${sub.careType ?? ""}`
                    : `${sub.purpose ?? ""} · ${sub.area ?? ""}`}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] text-[#bbb]">{new Date(sub.submitted_at).toLocaleString("ko-KR")}</p>
                  {sub.memo && (
                    <p className="truncate max-w-50 text-[11px] text-[#aaa]">📝 {sub.memo}</p>
                  )}
                </div>
              </div>
              <span className={`ml-3 shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold ${STATUS[sub.status].cls}`}>
                {STATUS[sub.status].label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white mx-4">

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-6 py-4">
              <h3 className="text-[16px] font-black text-[#1a1a1a]">{selected.name} 님 상담 신청</h3>
              <button onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#888] hover:bg-[#f5f5f5]">✕</button>
            </div>

            {/* 상세 내용 */}
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-3">
                {selected.selectedProducts?.length ? (
                  <>
                    {selected.selectedProducts.map((p) => (
                      <Row key={p.id} label="선택 제품" value={`${p.name} (${p.model})`} />
                    ))}
                    <Row label="이름" value={selected.name} />
                    <Row label="연락처" value={selected.phone} />
                    <Row label="관할타임" value={selected.careType ?? ""} />
                    <Row label="상담가능시간" value={selected.availableTime ?? "없음"} />
                    <Row label="추가내용" value={selected.extra ?? "없음"} />
                    <Row label="신청 일시" value={new Date(selected.submitted_at).toLocaleString("ko-KR")} />
                  </>
                ) : (
                  <>
                    <Row label="이름" value={selected.name} />
                    <Row label="연락처" value={selected.phone} />
                    <Row label="구매 목적" value={selected.purpose ?? ""} />
                    <Row label="배송 지역" value={selected.area ?? ""} />
                    <Row label="아파트" value={selected.apartment ?? "없음"} />
                    <Row label="견적 채널" value={(selected.channels ?? []).join(", ") || "없음"} />
                    <Row label="모델명" value={selected.model ?? "없음"} />
                    <Row label="신청 일시" value={new Date(selected.submitted_at).toLocaleString("ko-KR")} />
                  </>
                )}
              </div>

              {/* 메모 */}
              <div className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4">
                <p className="mb-2 text-[12px] font-semibold text-[#666]">메모</p>
                <textarea
                  value={memo}
                  onChange={(e) => { setMemo(e.target.value); setMemoSaved(false); }}
                  placeholder="내부 메모를 입력하세요..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-[#c90f45]"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[12px] transition-opacity ${memoSaved ? "text-green-500 opacity-100" : "opacity-0"}`}>저장되었습니다</span>
                  <button
                    onClick={saveMemo}
                    disabled={memoSaving}
                    className="h-8 rounded-full bg-[#1a1a1a] px-4 text-[12px] font-bold text-white hover:opacity-80 disabled:opacity-50"
                  >
                    {memoSaving ? "저장 중..." : "메모 저장"}
                  </button>
                </div>
              </div>
            </div>

            {/* 하단 액션 */}
            <div className="border-t border-[#f1f1f1] px-6 py-4 space-y-3">
              <p className="text-[12px] font-semibold text-[#666]">진행 상태 변경</p>
              <div className="flex gap-2">
                {(["new", "inProgress", "completed"] as const).map((s) => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                      selected.status === s ? "bg-[#c90f45] text-white" : "border border-[#e8e8e8] text-[#666] hover:border-[#c90f45]"
                    }`}>
                    {STATUS[s].label}
                  </button>
                ))}
              </div>
              <button onClick={() => handleDelete(selected.id)}
                className="flex h-10 w-full items-center justify-center rounded-full border border-red-200 text-[13px] text-red-400 hover:bg-red-50">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-20 shrink-0 text-[12px] font-semibold text-[#888]">{label}</span>
      <span className="text-[13px] text-[#333]">{value}</span>
    </div>
  );
}
