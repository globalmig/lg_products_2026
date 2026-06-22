"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { productStore, type ManagedProduct } from "@/lib/productStore";
import { adminStore } from "@/lib/adminStore";
import { LuSearch, LuX, LuPlus, LuCheck } from "react-icons/lu";

interface Props {
  initialIds?: string;
}

export default function ConsultForm({ initialIds }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [allProducts, setAllProducts] = useState<ManagedProduct[]>([]);
  const [selected, setSelected] = useState<ManagedProduct[]>([]);
  const [careType, setCareType] = useState("방문관리");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [extra, setExtra] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      productStore.products.getBySection("kitchen"),
      productStore.products.getBySection("tv"),
      productStore.products.getBySection("air"),
      productStore.products.getBySection("living"),
    ]).then(([kitchen, tv, air, living]) => {
      const all = [...kitchen, ...tv, ...air, ...living];
      setAllProducts(all);
      if (initialIds) {
        const ids = initialIds.split(",").map((s) => s.trim()).filter(Boolean);
        const pre = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as ManagedProduct[];
        setSelected(pre);
      }
    });
  }, [initialIds]);

  const toggleSelect = (product: ManagedProduct) => {
    setSelected((prev) => (prev.find((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]));
  };

  const filtered = allProducts.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      alert("제품을 1개 이상 선택해주세요.");
      return;
    }
    await adminStore.consult.add({
      id: Date.now().toString(),
      name,
      phone,
      selectedProducts: selected.map((p) => ({ id: p.id, name: p.name, model: p.model, image: p.image })),
      careType,
      availableTime,
      extra,
      submitted_at: new Date().toISOString(),
      status: "new",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-20 w-full text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf3f5] text-3xl">✓</div>
        <h2 className="mb-3 text-[24px] font-black tracking-tighter text-[#1a1a1a]">구독 신청이 완료되었습니다!</h2>
        <p className="mb-8 text-[14px] leading-relaxed text-[#888]">
          담당 매니저가 빠르게 연락드리겠습니다.
          <br />
          조금만 기다려주세요.
        </p>
        <Link href="/" className="flex h-11 items-center rounded-full bg-[#c90f45] px-8 text-[14px] font-bold text-white">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* 선택한 제품 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28 sm:pt-1">선택한 제품</span>
            <div className="min-w-0 flex-1">
              {selected.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-full border border-dashed border-[#c90f45] px-5 text-[13px] font-semibold text-[#c90f45]"
                >
                  <LuPlus size={14} />
                  제품 선택하기
                </button>
              ) : (
                <div className="space-y-3">
                  {selected.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
                        <Image src={p.image} alt={p.name} fill className="object-contain p-1" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[12px] leading-normal text-[#333]">{p.name}</p>
                        <p className="text-[11px] text-[#999]">{p.model}</p>
                      </div>
                      <button type="button" onClick={() => toggleSelect(p)} className="shrink-0 p-1 text-[#bbb] hover:text-[#c90f45]">
                        <LuX size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setPickerOpen(true)} className="flex h-9 items-center gap-1.5 rounded-full border border-dashed border-[#ddd] px-4 text-[12px] text-[#999]">
                    <LuPlus size={13} />
                    제품 추가
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 관할타임 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28 sm:pt-1">관할타임</span>
            <div className="flex gap-5">
              {["방문관리", "자가관리"].map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="careType" value={opt} checked={careType === opt} onChange={() => setCareType(opt)} className="accent-[#c90f45]" />
                  <span className="text-[14px] text-[#333]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 사용기간 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28">사용기간</span>
            <span className="text-[14px] text-[#333]">{careType === "방문관리" ? "의무사용 6년 / 계약기간 6년" : "의무사용 3년 / 계약기간 3년"}</span>
          </div>
        </div>

        {/* 고객명 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor="name" className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28">
              고객명
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-[#e0e0e0] px-3 text-[14px] outline-none focus:border-[#c90f45]"
            />
          </div>
        </div>

        {/* 연락처 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor="phone" className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28">
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-[#e0e0e0] px-3 text-[14px] outline-none focus:border-[#c90f45]"
            />
          </div>
        </div>

        {/* 상담가능시간 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor="availableTime" className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28">
              상담가능시간
            </label>
            <input
              id="availableTime"
              type="text"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              placeholder="상담받으시는 날짜 및 시간을 적어주세요"
              className="h-10 flex-1 rounded-lg border border-[#e0e0e0] px-3 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
            />
          </div>
        </div>

        {/* 추가내용 */}
        <div className="border-b border-[#f0f0f0] py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <label htmlFor="extra" className="shrink-0 text-[14px] font-semibold text-[#555] sm:w-28 sm:pt-2">
              추가내용
            </label>
            <textarea
              id="extra"
              rows={4}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="상담받으시는 제품을 적어주세요."
              className="flex-1 resize-none rounded-lg border border-[#e0e0e0] px-3 py-2 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
            />
          </div>
        </div>

        {/* 개인정보처리방침 */}
        <div className="py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-[#1a1a1a]">개인정보처리방침안내</p>
            <button type="button" onClick={() => setPrivacyOpen(true)} className="text-[12px] text-[#c90f45] underline underline-offset-2">
              자세히 보기
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-[#c90f45]" />
            <span className="text-[13px] text-[#333]">개인정보처리방침안내의 내용에 동의합니다.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!agreed}
          className="flex h-13 w-full items-center justify-center rounded-full bg-[#c90f45] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          신청하기
        </button>
      </form>

      {/* 제품 선택 모달 */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPickerOpen(false)} />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-150 flex-col rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-5 py-4">
              <h2 className="text-[16px] font-black tracking-tighter">제품 선택</h2>
              <button type="button" onClick={() => setPickerOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#888] hover:bg-[#f5f5f5]">
                <LuX size={16} />
              </button>
            </div>
            <div className="border-b border-[#f1f1f1] px-5 py-3">
              <div className="flex h-10 items-center gap-2 rounded-lg bg-[#f5f5f5] px-3">
                <LuSearch size={15} className="shrink-0 text-[#aaa]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="제품명 또는 모델명으로 검색"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#bbb]"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map((p) => {
                  const isSelected = !!selected.find((s) => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSelect(p)}
                      className={`relative rounded-xl border p-3 text-left transition-colors ${isSelected ? "border-[#c90f45] bg-[#fdf3f5]" : "border-[#f0f0f0] hover:border-[#ddd]"}`}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c90f45]">
                          <LuCheck size={11} className="text-white" />
                        </div>
                      )}
                      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-[#f7f7f7]">
                        <Image src={p.image} alt={p.name} fill className="object-contain p-2" unoptimized />
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-[1.4] text-[#333]">{p.name}</p>
                      <p className="mt-0.5 text-[10px] text-[#aaa]">{p.model}</p>
                    </button>
                  );
                })}
              </div>
              {filtered.length === 0 && <div className="py-10 text-center text-[13px] text-[#aaa]">검색 결과가 없습니다</div>}
            </div>
            <div className="border-t border-[#f1f1f1] px-5 py-4">
              <button type="button" onClick={() => setPickerOpen(false)} className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white">
                선택 완료{selected.length > 0 && ` (${selected.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPrivacyOpen(false)} />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl mx-4">
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-6 py-4">
              <h2 className="text-[15px] font-black text-[#1a1a1a]">개인정보처리방침안내</h2>
              <button type="button" onClick={() => setPrivacyOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#888] hover:bg-[#f5f5f5]">
                <LuX size={16} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 text-[12px] leading-relaxed text-[#444]">
              <p className="mb-3 font-bold text-[13px]">LG전자 온라인 전문점 공식접수센터(주식회사)개인정보처리방침</p>
              <p className="mb-2">공식접수센터(주식회사)는 정보주체의 개인 정보를 보호하기 위하여 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 및 「개인정보보호법」 등 관련 법령상의 개인정보 보호 규정을 준수하고 있으며 다음과 같은 개인정보 처리 방침을 가지고 있습니다.</p>
              <p className="mb-2">회사는 개인정보처리방침을 통하여 정보주체의 개인정보가 어떠한 목적과 방식으로 수집 이용되고 있으며, 정보주체의 개인정보 보호를 위해 회사가 어떠한 조치를 취하고 있는지 알려드립니다.</p>
              <p className="mb-4">본 개인정보처리방침은 관련 법령의 개정이나 회사의 정책에 의해 변경될 수 있으므로 회사의 홈사이트 방문 이용 시에 수시로 확인하여 주시기 바랍니다.</p>
              <ol className="mb-4 list-decimal space-y-1 pl-4">
                <li>수집하는 개인정보의 항목 및 수집방법</li>
                <li>개인정보의 보유 및 이용 기간</li>
                <li>개인정보의 제 3자 제공에 관한 사항</li>
                <li>개인정보의 처리 위탁에 관한 사항</li>
                <li>개인정보 파기 절차 및 방법에 관한 사항</li>
                <li>정보주체와 법정대리인의 권리·의무 및 행사방법에 관한 사항</li>
                <li>개인정보의 안전성 확보조치에 관한 사항</li>
                <li>개인정보를 자동으로 수집하는 장치의 설치·운영 및 그 거부에 관한 사항</li>
                <li>추가적인 이용·제공 관련 판단 기준</li>
                <li>개인정보 보호책임자 및 고충처리 부서</li>
                <li>개인정보처리방침의 변경에 관한 사항</li>
              </ol>
              <p className="mb-2 font-semibold">1. 개인정보의 처리 항목 및 수집방법</p>
              <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리하며, 다음의 목적 이외 용도로는 처리하지 않습니다.</p>
              <p className="mb-1 font-medium">(1) 처리 항목 및 목적</p>
              <table className="mb-4 w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#f5f5f5]">
                    <th className="border border-[#ddd] px-2 py-1.5 text-left font-semibold">업무 구분</th>
                    <th className="border border-[#ddd] px-2 py-1.5 text-left font-semibold">항목</th>
                    <th className="border border-[#ddd] px-2 py-1.5 text-left font-semibold">목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#ddd] px-2 py-2">구독상담 예약</td>
                    <td className="border border-[#ddd] px-2 py-2">[필수] 이름, 연락처</td>
                    <td className="border border-[#ddd] px-2 py-2">구독 상담 예약 및 진행</td>
                  </tr>
                </tbody>
              </table>
              <p className="mb-2 font-semibold">2. 개인정보의 보유 및 이용 기간</p>
              <p className="mb-4">수집된 개인정보는 구독 상담 완료 후 6개월간 보관하며, 이후 즉시 파기합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.</p>
              <p className="mb-2 font-semibold">3. 개인정보의 제 3자 제공에 관한 사항</p>
              <p className="mb-4">회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 따라 허용된 경우는 예외로 합니다.</p>
              <p className="mb-2 font-semibold">4. 개인정보의 처리 위탁에 관한 사항</p>
              <p className="mb-4">회사는 원활한 서비스 제공을 위해 필요한 범위 내에서만 개인정보 처리를 위탁하며, 수탁자에 대한 관리·감독을 철저히 수행합니다.</p>
              <p className="mb-2 font-semibold">5. 개인정보 파기 절차 및 방법에 관한 사항</p>
              <p className="mb-4">보유기간이 경과하거나 처리목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄 또는 소각합니다.</p>
              <p className="mb-2 font-semibold">6. 정보주체와 법정대리인의 권리·의무 및 행사방법에 관한 사항</p>
              <p className="mb-4">정보주체는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있으며, 회사는 이에 신속하게 대응합니다.</p>
              <p className="mb-2 font-semibold">7. 개인정보의 안전성 확보조치에 관한 사항</p>
              <p className="mb-4">회사는 개인정보의 안전성 확보를 위해 관리적, 기술적, 물리적 보호조치를 시행하고 있습니다.</p>
              <p className="mb-2 font-semibold">8. 개인정보를 자동으로 수집하는 장치의 설치·운영 및 그 거부에 관한 사항</p>
              <p className="mb-4">회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(cookie)를 사용할 수 있습니다. 이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</p>
              <p className="mb-2 font-semibold">9. 추가적인 이용·제공 관련 판단 기준</p>
              <p className="mb-4">회사는 개인정보 보호법 제15조 제3항 및 제17조 제4항에 따라 추가적인 이용·제공 시 당초 수집 목적과의 관련성, 예측 가능성, 이익 침해 여부 등을 고려합니다.</p>
              <p className="mb-2 font-semibold">10. 개인정보 보호책임자 및 고충처리 부서</p>
              <p className="mb-4">개인정보 처리에 관한 문의는 담당 매니저에게 연락주시기 바랍니다.</p>
              <p className="mb-2 font-semibold">11. 개인정보처리방침의 변경에 관한 사항</p>
              <p>본 개인정보처리방침은 법령·정책 변경에 따라 개정될 수 있으며, 변경 시 홈페이지를 통해 공지합니다.</p>
            </div>
            <div className="border-t border-[#f1f1f1] px-6 py-4">
              <button type="button" onClick={() => { setAgreed(true); setPrivacyOpen(false); }}
                className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white">
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
