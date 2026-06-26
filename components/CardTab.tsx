"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { adminStore, imageUrl } from "@/lib/adminStore";
import { CARD_DEFAULTS, type CardData, type CardDetailJson } from "@/data/cardData";

function CoinIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f5c842] to-[#e0a800] shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="#f5c842" stroke="#c8960a" strokeWidth="1.5" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8a6200">
          ₩
        </text>
      </svg>
    </div>
  );
}

function CardVisual({ card, imgSrc, size = "lg" }: { card: CardData; imgSrc: string; size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return <Image src={imgSrc} alt={card.company} width={isLg ? 200 : 90} height={isLg ? 320 : 144} className={`rounded-xl shadow-md ${isLg ? "w-24 sm:w-36 md:w-44 lg:w-50" : "w-15 sm:w-20 md:w-22.5"}`} style={{ height: "auto" }} unoptimized />;
}

export default function CardTab() {
  const [activeId, setActiveId] = useState(CARD_DEFAULTS[0].id);
  const [detailOpen, setDetailOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [dbImages, setDbImages] = useState<Record<string, string>>({});
  const [dbDetails, setDbDetails] = useState<Record<string, CardDetailJson>>({});

  useEffect(() => {
    adminStore.cardDiscounts.get().then((list) => {
      const imgMap: Record<string, string> = {};
      const detailMap: Record<string, CardDetailJson> = {};
      list.forEach((c) => {
        if (c.image_key) imgMap[c.id] = imageUrl(c.image_key);
        if (c.card_detail_json) {
          try { detailMap[c.id] = JSON.parse(c.card_detail_json); } catch {}
        }
      });
      setDbImages(imgMap);
      setDbDetails(detailMap);
    });
  }, []);

  const getCard = (card: CardData): CardData => {
    const dbDetail = dbDetails[card.id];
    const image = dbImages[card.id] || card.image;
    if (!dbDetail) return { ...card, image };
    return {
      ...card,
      ...dbDetail,
      id: card.id,
      image,
      annualFee: dbDetail.annualFee ?? card.annualFee,
      tiers: dbDetail.tiers ?? card.tiers,
      notes: dbDetail.notes ?? card.notes,
      detail: {
        ...card.detail,
        ...(dbDetail.detail ?? {}),
        tableRows: dbDetail.detail?.tableRows ?? card.detail.tableRows,
        tableNotes: dbDetail.detail?.tableNotes ?? card.detail.tableNotes,
        excludedItems: dbDetail.detail?.excludedItems ?? card.detail.excludedItems,
      },
    };
  };

  const baseActive = CARD_DEFAULTS.find((c) => c.id === activeId)!;
  const active = getCard(baseActive);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1440px]  px-5">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-[13px] font-medium text-[#c90f45]">제휴 카드 혜택도 있나요?</p>
          <h2 className="mb-4 text-[32px] font-black leading-[1.35] tracking-tighter text-[#1a1a1a]">
            다양한 제휴카드로 월 구독료 할인을
            <br />
            받을 수 있습니다
          </h2>
          <p className="text-[14px] leading-[1.7] text-[#c90f45]">전월 실적에 따라 월 1회 할인이 적용되며, 다른 가전 추가 구독 시 다른 카드사의 제휴카드를 이용해야만 할인이 적용됩니다.</p>
        </div>

        {/* Card Tab Selector */}
        <div className="mb-10 overflow-x-auto w-full">
          <div className="flex gap-3 pb-2 bg-white justify-between" style={{ minWidth: "max-content" }}>
            {CARD_DEFAULTS.map((baseCard) => {
              const card = getCard(baseCard);
              const isActive = card.id === activeId;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setActiveId(card.id);
                    setDetailOpen(false);
                    setNotesOpen(false);
                  }}
                  className="flex flex-col items-center   gap-2"
                >
                  <span
                    className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
                      isActive ? "bg-[#1a1a1a] text-white" : "border border-[#ddd] bg-white text-[#555] hover:border-[#aaa]"
                    }`}
                  >
                    {card.company}
                  </span>
                  <span className="h-4 text-[10px] text-[#888]">{card.label ?? ""}</span>
                  <CardVisual card={card} imgSrc={card.image} size="sm" />
                  <div className="text-center">
                    <p className="text-[11px] text-[#888]">{card.minSpend} 사용 시</p>
                    <p className="text-[11px] text-[#888]">월 최대 할인</p>
                    <p className="text-[14px] font-black text-[#1a1a1a]">{card.maxDiscount}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Card Detail */}
        <div className="mb-0 rounded-t-2xl border border-b-0 border-[#e8e8e8] bg-white ">
          <div className="p-8">
            <h3 className="mb-8 text-[22px] font-black tracking-[-0.04em] text-[#1a1a1a]">{active.fullName}</h3>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10 lg:gap-20">
              {/* Left: card image */}
              <div className="flex shrink-0 flex-col items-center gap-3">
                <CardVisual card={active} imgSrc={active.image} size="lg" />
                <button type="button" className="text-[13px] text-[#555] hover:text-[#1a1a1a]">
                  카드 정보 자세히 보기 &gt;
                </button>
              </div>

              {/* Right: tiers */}
              <div className="flex flex-1 flex-col gap-3">
                {active.benefitPeriod && (
                  <div className="flex gap-4 rounded-xl bg-[#fafafa] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[20px]">📅</div>
                    <div>
                      <p className="text-[13px] text-[#666]">혜택 기간</p>
                      <p className="text-[16px] font-black text-[#1a1a1a]">{active.benefitPeriod}</p>
                    </div>
                  </div>
                )}
                {active.tiers.map((tier, i) => (
                  <div key={i} className="flex gap-4 rounded-xl bg-[#fafafa] p-4">
                    <CoinIcon />
                    <div>
                      <p className="text-[13px] text-[#666]">{tier.spend}</p>
                      <p className="text-[16px] font-black text-[#1a1a1a]">{tier.discount}</p>
                      {tier.note && <p className="mt-1 text-[11px] leading-[1.5] text-[#999]">*{tier.note}</p>}
                    </div>
                  </div>
                ))}

                {/* Annual fee */}
                <div className="flex gap-4 rounded-xl bg-[#fafafa] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="6" width="18" height="13" rx="2" stroke="#888" strokeWidth="1.5" />
                      <path d="M3 10h18" stroke="#888" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#666]">연회비</p>
                    <p className="text-[14px] font-bold text-[#1a1a1a]">
                      국내전용 : {active.annualFee.domestic}
                      {active.annualFee.overseas && (
                        <>
                          {" "}
                          / {active.annualFee.overseasLabel ?? "해외겸용"} : {active.annualFee.overseas}
                          {active.annualFee.brand && ` (${active.annualFee.brand})`}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion: 카드 상세 내용 */}
        <div className="border border-b-0 border-[#e8e8e8]">
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-2 border-t border-[#e8e8e8] py-4 text-[14px] font-bold text-[#1a1a1a] hover:bg-[#fafafa]"
          >
            카드 상세 내용
            <span className="text-[12px] text-[#888]">{detailOpen ? "▲" : "▼"}</span>
          </button>

          {detailOpen && (
            <div className="border-t border-[#e8e8e8] px-4 py-5 sm:px-8 sm:py-6">
              {/* Info rows */}
              <div className="mb-6 space-y-2">
                {active.detail.features && active.detail.features.length > 0 && (
                  <div className="flex gap-2 text-[13px] sm:text-[14px]">
                    <span className="w-14 shrink-0 font-bold text-[#1a1a1a] sm:w-16">특장점</span>
                    <div className="text-[#555]">
                      {active.detail.features.map((f, i) => <p key={i}>· {f}</p>)}
                    </div>
                  </div>
                )}
                {active.detail.targetCard && (
                  <div className="flex gap-2 text-[13px] sm:text-[14px]">
                    <span className="w-14 shrink-0 font-bold text-[#1a1a1a] sm:w-16">대상카드</span>
                    <span className="text-[#555]">· {active.detail.targetCard}</span>
                  </div>
                )}
                {active.detail.period && (
                  <div className="flex gap-2 text-[13px] sm:text-[14px]">
                    <span className="w-14 shrink-0 font-bold text-[#1a1a1a] sm:w-16">기간</span>
                    <span className="text-[#555]">· {active.detail.period}</span>
                  </div>
                )}
                {active.detail.benefit && (
                  <div className="flex gap-2 text-[13px] sm:text-[14px]">
                    <span className="w-14 shrink-0 font-bold text-[#1a1a1a] sm:w-16">혜택</span>
                    <span className="text-[#555]">· {active.detail.benefit}</span>
                  </div>
                )}
                {active.detail.showAnnualFeeInDetail && (
                  <div className="flex gap-2 text-[13px] sm:text-[14px]">
                    <span className="w-14 shrink-0 font-bold text-[#1a1a1a] sm:w-16">연회비</span>
                    <div className="text-[#555]">
                      <p>· 국내전용 : {active.annualFee.domestic}</p>
                      {active.annualFee.overseas && (
                        <p>
                          · {active.annualFee.overseasLabel ?? "해외겸용"} : {active.annualFee.overseas}
                          {active.annualFee.brand && ` (${active.annualFee.brand})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Benefit table */}
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-max border-collapse text-[11px] sm:text-[13px]">
                  {active.detail.tableStyle === "basic" ? (
                    <>
                      <thead>
                        {active.detail.tableTitle && (
                          <tr className="bg-[#e8e8e8]">
                            <th colSpan={2} className="whitespace-pre-line border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                              {active.detail.tableTitle}
                            </th>
                          </tr>
                        )}
                        <tr className="bg-[#f0f0f0]">
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">전월 실적(1일~말일)</th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">기본 서비스</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.detail.tableRows.map((row, i) => (
                          <tr key={i} className="even:bg-[#fafafa]">
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.minSpend}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3 sm:py-3">{row.directDiscount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : active.detail.tableStyle === "simple" ? (
                    <>
                      <thead>
                        {active.detail.tableTitle && (
                          <tr className="bg-[#e8e8e8]">
                            <th colSpan={5} className="whitespace-pre-line border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                              {active.detail.tableTitle}
                            </th>
                          </tr>
                        )}
                        <tr className="bg-[#f0f0f0]">
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            전월 실적
                            <br />
                            (1일~말일)
                          </th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">기본 서비스</th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            프로모션 혜택
                            <br />
                            {active.detail.promoMonthsLabel ?? "(72개월)"}
                          </th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">혜택 합계</th>
                          <th className="border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">비고</th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.detail.tableRows.map((row, i) => (
                          <tr key={i} className="even:bg-[#fafafa]">
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.minSpend}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.directDiscount}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.promoDiscount ?? "-"}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3 sm:py-3">{row.total}</td>
                            <td className="min-w-35 border border-[#ddd] px-2 py-2 text-[10px] text-[#555] sm:min-w-50 sm:px-3 sm:py-3 sm:text-[12px]">
                              {row.remarks?.map((r, j) => (
                                <p key={j} className="leading-[1.6]">· {r}</p>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr className="bg-[#f0f0f0]">
                          <th rowSpan={2} className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            전월 실적
                            <br />
                            (1일~말일)
                          </th>
                          <th colSpan={2} className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            카드 서비스
                          </th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            프로모션 혜택
                            <br />
                            (72개월)
                          </th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">혜택 합계</th>
                          <th className="border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">비고</th>
                        </tr>
                        <tr className="bg-[#f0f0f0]">
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">결제일 할인</th>
                          <th className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3">
                            포인트 적립
                            <br />
                            (구독요금
                            <br />
                            7만원 이상 시)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.detail.tableRows.map((row, i) => (
                          <tr key={i} className="even:bg-[#fafafa]">
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.minSpend}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.directDiscount}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.pointAccrual ?? "-"}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center sm:px-3 sm:py-3">{row.promoDiscount ?? "-"}</td>
                            <td className="whitespace-nowrap border border-[#ddd] px-2 py-2 text-center font-bold sm:px-3 sm:py-3">{row.total}</td>
                            <td className="min-w-35 border border-[#ddd] px-2 py-2 text-[10px] text-[#555] sm:min-w-50 sm:px-3 sm:py-3 sm:text-[12px]">
                              {row.remarks?.map((r, j) => (
                                <p key={j} className="leading-[1.6]">· {r}</p>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>

              {active.detail.tableNotes.map((note, i) => (
                <p key={i} className="mb-3 text-[11px] leading-[1.6] text-[#888] sm:text-[12px]">
                  {note}
                </p>
              ))}

              {/* Excluded items */}
              {active.detail.excludedItems.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[13px] font-bold text-[#1a1a1a]">* 전월 실적 제외항목</p>
                  <div className="space-y-1">
                    {active.detail.excludedItems.map((item, i) => (
                      <p key={i} className="text-[11px] leading-[1.7] text-[#666] sm:text-[12px]">
                        - {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion: 유의 사항 */}
        <div className="rounded-b-2xl border border-[#e8e8e8]">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-2 border-t border-[#e8e8e8] py-4 text-[14px] font-bold text-[#1a1a1a] hover:bg-[#fafafa]"
          >
            유의 사항
            <span className="text-[12px] text-[#888]">{notesOpen ? "▲" : "▼"}</span>
          </button>

          {notesOpen && (
            <div className="border-t border-[#e8e8e8] px-4 py-4 sm:px-8 sm:py-6">
              <ul className="space-y-2">
                {active.notes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-[1.7] text-[#555]">
                    <span className="mt-0.75 shrink-0 text-[#888]">·</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
