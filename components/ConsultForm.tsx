"use client";

import { useState, useRef } from "react";
import { adminStore } from "@/lib/adminStore";
import Link from "next/link";

// PRIVACY_CONTENT는 모달 내부에서 JSX 테이블로 렌더링하므로 제거

const estimateChannels = ["LG베스트샵 타지점", "이마트(일렉트로마트)/홈플러스", "하이마트/전자랜드", "온라인", "삼성스토어"];

export default function ConsultForm() {
  const [submitted, setSubmitted] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [purposeEtc, setPurposeEtc] = useState("");
  const [apartment, setApartment] = useState("");
  const [apartmentName, setApartmentName] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLTextAreaElement>(null);

  const toggleChannel = (ch: string) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 최대 10MB까지 가능합니다.");
      e.target.value = "";
      return;
    }
    setFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.consult.add({
      id: Date.now().toString(),
      name: nameRef.current?.value ?? "",
      phone: phoneRef.current?.value ?? "",
      purpose: purpose === "기타" ? purposeEtc : purpose,
      area: areaRef.current?.value ?? "",
      apartment: apartment === "네" ? `네 (${apartmentName})` : apartment,
      channels,
      model: modelRef.current?.value ?? "",
      submittedAt: new Date().toISOString(),
      status: "new",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf3f5] text-3xl">✓</div>
        <h2 className="mb-3 text-[24px] font-black tracking-tighter text-[#1a1a1a]">상담 신청이 완료되었습니다!</h2>
        <p className="mb-8 text-[14px] leading-relaxed text-[#888]">
          담당 매니저가 빠르게 연락드리겠습니다.
          <br />
          조금만 기다려주세요 🫡
        </p>
        <Link href="/" className="flex h-11 items-center rounded-full bg-[#c90f45] px-8 text-[14px] font-bold text-white">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 성함 */}
      <div>
        <label className="mb-1.5 block text-[14px] font-bold text-[#1a1a1a]">
          고객님의 성함을 입력해주세요! <span className="text-[#c90f45]">*</span>
        </label>
        <input
          type="text"
          required
          ref={nameRef}
          placeholder="홍길동"
          className="h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
        />
      </div>

      {/* 연락처 */}
      <div>
        <label className="mb-1 block text-[14px] font-bold text-[#1a1a1a]">
          🚀 연락처를 입력해주세요 <span className="text-[#c90f45]">*</span>
        </label>
        <p className="mb-2 text-[12px] text-[#888]">잘못 입력되지 않도록 주의해주세요! 🫡</p>
        <input
          type="tel"
          required
          ref={phoneRef}
          placeholder="010-1234-5678 또는 01012345678"
          className="h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
        />
      </div>

      {/* 구매 목적 */}
      <div>
        <label className="mb-1 block text-[14px] font-bold text-[#1a1a1a]">
          구매 목적을 선택해주세요 <span className="text-[#c90f45]">*</span>
        </label>
        <p className="mb-3 text-[12px] leading-relaxed text-[#888]">
          혼수·이사가 아닌 단품의 경우 기타를 선택 후 제품군을 입력해주세요.
          <br />
          예) 냉장고 600리터 / 컨버터블 / 에어컨 2in1
        </p>
        <div className="space-y-2">
          {["웨딩_결혼_혼수", "이사_입주"].map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e8e8] px-4 py-3 has-[:checked]:border-[#c90f45] has-[:checked]:bg-[#fdf3f5]">
              <input type="radio" name="purpose" value={opt} required checked={purpose === opt} onChange={() => setPurpose(opt)} className="accent-[#c90f45]" />
              <span className="text-[14px] text-[#333]">{opt.replaceAll("_", " · ")}</span>
            </label>
          ))}
          <div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e8e8] px-4 py-3 has-[:checked]:border-[#c90f45] has-[:checked]:bg-[#fdf3f5]">
              <input type="radio" name="purpose" value="기타" checked={purpose === "기타"} onChange={() => setPurpose("기타")} className="accent-[#c90f45]" />
              <span className="text-[14px] text-[#333]">기타 (단품)</span>
            </label>
            {purpose === "기타" && (
              <input
                type="text"
                placeholder="예) 냉장고 600리터, 에어컨 2in1"
                value={purposeEtc}
                onChange={(e) => setPurposeEtc(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
              />
            )}
          </div>
        </div>
      </div>

      {/* 배송 지역 */}
      <div>
        <label className="mb-1 block text-[14px] font-bold text-[#1a1a1a]">
          배송받으실 지역을 입력해주세요 <span className="text-[#c90f45]">*</span>
        </label>
        <p className="mb-2 text-[12px] text-[#888]">시, 구까지만 입력해주세요. 예) 서울시 용산구, 인천 계양구</p>
        <input
          type="text"
          required
          ref={areaRef}
          placeholder="서울시 용산구"
          className="h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
        />
      </div>

      {/* 아파트 거주 여부 */}
      <div>
        <label className="mb-3 block text-[14px] font-bold text-[#1a1a1a]">
          아파트에 거주하고 계신가요? <span className="text-[#c90f45]">*</span>
        </label>
        <div className="space-y-2">
          {["네", "아니요"].map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e8e8] px-4 py-3 has-[:checked]:border-[#c90f45] has-[:checked]:bg-[#fdf3f5]">
              <input type="radio" name="apartment" value={opt} checked={apartment === opt} onChange={() => setApartment(opt)} className="accent-[#c90f45]" />
              <span className="text-[14px] text-[#333]">{opt === "네" ? "네! (아파트명을 아래에 입력해주세요)" : "아니요"}</span>
            </label>
          ))}
          {apartment === "네" && (
            <input
              type="text"
              required
              placeholder="아파트명을 입력해주세요"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e8e8e8] px-4 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
            />
          )}
        </div>
      </div>

      {/* 견적 채널 */}
      <div>
        <label className="mb-3 block text-[14px] font-bold text-[#1a1a1a]">견적을 받아보신 채널을 선택해주세요</label>
        <div className="space-y-2">
          {estimateChannels.map((ch) => (
            <label key={ch} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e8e8] px-4 py-3 has-[:checked]:border-[#c90f45] has-[:checked]:bg-[#fdf3f5]">
              <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} className="accent-[#c90f45]" />
              <span className="text-[14px] text-[#333]">{ch}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 제품 모델명 */}
      <div>
        <label className="mb-1 block text-[14px] font-bold text-[#1a1a1a]">🚀 상담받으실 제품 모델명을 입력해주세요</label>
        <p className="mb-2 text-[12px] text-[#888]">모델명을 알고 계시면 더 빠른 상담이 가능합니다!</p>
        <textarea
          ref={modelRef}
          rows={3}
          placeholder="예) LG 오브제컬렉션 냉장고 M874 / LMWS27596S"
          className="w-full resize-none rounded-xl border border-[#e8e8e8] px-4 py-3 text-[14px] outline-none placeholder:text-[#bbb] focus:border-[#c90f45]"
        />
      </div>

      {/* 파일 업로드 */}
      <div>
        <label className="mb-1 block text-[14px] font-bold text-[#1a1a1a]">타사 견적서 업로드 (선택)</label>
        <p className="mb-3 text-[12px] text-[#888]">이미지 파일 1개 / 최대 10MB</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e8e8e8] py-8 text-center transition-colors hover:border-[#c90f45]"
        >
          <span className="mb-2 text-2xl">📎</span>
          {fileName ? (
            <p className="text-[13px] font-medium text-[#c90f45]">{fileName}</p>
          ) : (
            <>
              <p className="text-[13px] font-medium text-[#555]">파일을 클릭하여 업로드하세요</p>
              <p className="text-[11px] text-[#aaa]">최대 10MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* 개인정보 동의 */}
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== "BUTTON") setAgreed((v) => !v);
        }}
        className={`cursor-pointer rounded-xl border p-4 transition-colors ${agreed ? "border-[#c90f45] bg-[#fdf3f5]" : "border-[#e8e8e8]"}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#1a1a1a]">
            개인정보 수집 및 이용 동의 <span className="text-[#c90f45]">*</span>
          </p>
          <button type="button" onClick={() => setPrivacyOpen(true)} className="text-[12px] text-[#c90f45] underline underline-offset-2">
            전문 보기
          </button>
        </div>
        <p className="mb-3 text-[12px] leading-relaxed text-[#888]">수집 항목: 이름, 연락처 · 수집 목적: 구독 상담 예약 및 진행 · 보유 기간: 신청일로부터 6개월</p>
        <div className="flex items-center gap-2">
          <input type="checkbox" required checked={agreed} onChange={() => {}} className="accent-[#c90f45]" />
          <span className="text-[13px] text-[#555]">개인정보 수집 및 이용에 동의합니다</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!agreed}
        className="flex h-13 w-full items-center justify-center rounded-full bg-[#c90f45] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        상담 신청하기 🚀
      </button>

      {/* 개인정보 모달 */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPrivacyOpen(false)} />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-150 flex-col rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#f1f1f1] px-6 py-4">
              <h2 className="text-[16px] font-black tracking-tighter text-[#1a1a1a]">구독상담 개인정보 수집·이용 동의서</h2>
              <button type="button" onClick={() => setPrivacyOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#888] hover:bg-[#f5f5f5]">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 text-[13px] leading-relaxed text-[#444]">
              <p className="mb-4">
                (주)와이케이지 이하 ("당사")는 구독상담을 이용하는 귀하의 개인정보를 아래와 같이 수집·이용합니다. 상세한 내용은 개인정보 처리방침에서 확인하실 수 있습니다.
              </p>
              <table className="mb-4 w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f5f5f5]">
                    <th className="border border-[#ddd] px-3 py-2 text-left font-semibold text-[#333]">수집 항목</th>
                    <th className="border border-[#ddd] px-3 py-2 text-left font-semibold text-[#333]">수집 목적</th>
                    <th className="border border-[#ddd] px-3 py-2 text-left font-semibold text-[#333]">보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#ddd] px-3 py-3 align-top">이름, 연락처</td>
                    <td className="border border-[#ddd] px-3 py-3 align-top">구독 상담 예약, 구독 상담 진행</td>
                    <td className="border border-[#ddd] px-3 py-3 align-top">
                      <strong>신청일로부터 6개월까지 보관 후 파기</strong>
                      <span className="mt-1 block text-[11px] text-[#777]">
                        (다만, 관계법령의 규정이나 회사 내부 방침에 의하여 보존할 필요가 있는 경우 당사는 해당 법령 및 당사 개인정보처리방침에서 정한 바에 따라 개인정보를 보관할 수 있습니다.)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[12px] text-[#555]">
                귀하는 위 정보에 대한 수집·이용 동의를 거부할 수 있는 권리가 있으나, 이에 동의하지 않을 경우 구독상담이 제한될 수 있습니다.
              </p>
            </div>
            <div className="border-t border-[#f1f1f1] px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setAgreed(true);
                  setPrivacyOpen(false);
                }}
                className="flex h-11 w-full items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white"
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
