import ConsultForm from "@/components/ConsultForm";

export const metadata = {
  title: "구독신청 | LG전자 BEST SHOP",
  description: "LG베스트샵 용산전자상가점 가전 구독 신청",
};

export default async function ConsultPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-xl px-5 py-10">
        <h1 className="mb-6 text-[24px] font-black tracking-tighter text-[#1a1a1a]">구독신청</h1>
        <hr className="mb-0 border-[#1a1a1a]" />
        <ConsultForm initialIds={ids} />
      </div>
    </main>
  );
}
