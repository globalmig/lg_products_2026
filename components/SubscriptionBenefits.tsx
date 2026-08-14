import { LuWrench, LuRefreshCw, LuShieldCheck, LuTruck } from "react-icons/lu";

const benefits = [
  { Icon: LuWrench, title: "전문가 정기 점검", desc: "전문 매니저가 정기적으로 방문해 제품 상태를 점검·관리합니다." },
  { Icon: LuRefreshCw, title: "제품 업그레이드", desc: "약정 기간 후 최신 제품으로 업그레이드할 수 있습니다." },
  { Icon: LuShieldCheck, title: "완전 보장 서비스", desc: "사용 중 고장 시 무상 수리 또는 교체로 걱정 없이 사용하세요." },
  { Icon: LuTruck, title: "무료 배송·설치", desc: "전문 설치 기사가 무료로 배송 및 설치를 진행합니다." },
];

export default function SubscriptionBenefits() {
  return (
    <section className="border-t border-[#f1f1f1] bg-[#fafafa] px-5 py-12">
      <div className="mx-auto max-w-270">
        <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em]">가전구독 혜택</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f3]">
                <Icon size={20} className="text-[#c90f45]" />
              </div>
              <h3 className="mb-2 text-[15px] font-black">{title}</h3>
              <p className="text-[13px] leading-[1.7] text-[#666]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
