"use client";

interface Props {
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message = "정말 삭제하시겠습니까?", onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-[320px] rounded-2xl bg-white p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="mb-1 text-[17px] font-black text-[#1a1a1a]">삭제 확인</p>
        <p className="mb-7 text-[14px] leading-[1.6] text-[#555]">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex h-10 flex-1 items-center justify-center rounded-full border border-[#e0e0e0] text-[14px] font-semibold text-[#555] hover:border-[#bbb]"
          >
            아니요
          </button>
          <button
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-red-500 text-[14px] font-bold text-white hover:bg-red-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
