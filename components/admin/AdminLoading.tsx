export default function AdminLoading({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-[#bbb]">
      <svg className="mb-3 h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-[13px]">{label}</p>
    </div>
  );
}
