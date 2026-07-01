import Link from "next/link";

export default function EventBanner() {
  return (
    <section className="bg-gradient-to-r from-[#c90f45] to-[#9b0a33] py-8 sm:py-10">
      <div className="mx-auto flex max-w-300 flex-col items-center gap-5 px-5 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div>
          <p className="mb-1 text-[12px] sm:text-[13px] font-semibold text-[#ffb3c8]">6월 한정 특가</p>
          <h2 className="break-keep text-[20px] font-black tracking-[-0.04em] text-white sm:text-[26px]">
            6월 행사 진행 중 🎉
          </h2>
          <p className="mt-1 break-keep text-[12px] text-[#ffd6e2] sm:text-[13px]">
            이달의 특별 할인 혜택을 놓치지 마세요
          </p>
        </div>

        <Link
          href="/benefit"
          className="shrink-0 rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-[#c90f45] transition-opacity hover:opacity-90"
        >
          혜택 확인하기 →
        </Link>
      </div>
    </section>
  );
}
