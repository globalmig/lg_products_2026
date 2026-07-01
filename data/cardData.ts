export interface CardTier {
  spend: string;
  discount: string;
  note?: string;
}

export interface CardTableRow {
  minSpend: string;
  directDiscount: string;
  pointAccrual?: string;
  promoDiscount?: string;
  total: string;
  remarks?: string[];
}

export interface CardDetailJson {
  company?: string;
  label?: string;
  fullName?: string;
  minSpend?: string;
  maxDiscount?: string;
  benefitPeriod?: string;
  officialUrl?: string;
  annualFee?: {
    domestic: string;
    overseas?: string;
    brand?: string;
    overseasLabel?: string;
  };
  tiers?: CardTier[];
  notes?: string[];
  detail?: {
    targetCard?: string;
    period?: string;
    benefit?: string;
    features?: string[];
    tableTitle?: string;
    tableStyle?: "full" | "simple" | "basic";
    promoMonthsLabel?: string;
    showAnnualFeeInDetail?: boolean;
    tableRows?: CardTableRow[];
    tableNotes?: string[];
    excludedItems?: string[];
  };
}

export interface CardData extends CardDetailJson {
  id: string;
  image: string;
  company: string;
  fullName: string;
  minSpend: string;
  maxDiscount: string;
  annualFee: { domestic: string; overseas?: string; brand?: string; overseasLabel?: string };
  tiers: CardTier[];
  notes: string[];
  detail: NonNullable<CardDetailJson["detail"]> & {
    tableRows: CardTableRow[];
    tableNotes: string[];
    excludedItems: string[];
  };
}

export const CARD_DEFAULTS: CardData[] = [
  {
    id: "shinhan",
    company: "신한카드",
    fullName: "[신한] LG전자 The 구독케어 신한카드",
    minSpend: "130만원 이상",
    maxDiscount: "30,000원",
    officialUrl: "https://www.shinhancard.com/pconts/html/card/apply/credit/1234346_2207.html",
    image: "/images/card/신한카드.jpg",
    annualFee: { domestic: "22,000원", overseas: "25,000원", brand: "Mastercard" },
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 17,000원 할인" },
      { spend: "70만원 이상 사용 시", discount: "월 최대 27,000원 할인", note: "할인 금액 중 일부는 포인트로 적립되며, 자세한 내용은 카드 상세에서 확인 가능합니다." },
      { spend: "130만원 이상 사용 시", discount: "월 최대 30,000원 할인", note: "할인 금액 중 일부는 포인트로 적립되며, 자세한 내용은 카드 상세에서 확인 가능합니다." },
    ],
    detail: {
      targetCard: "LG전자 The 구독케어 신한카드 (Mastercard)",
      period: "2026.05.01~2026.05.31",
      benefit: "이벤트 기간 내 대상 카드로 LG전자 구독 요금 자동이체 시 프로모션 혜택 제공",
      tableRows: [
        { minSpend: "30만원 이상", directDiscount: "13,000원", promoDiscount: "4,000원", total: "17,000원", remarks: ["LG전자 The 구독케어 신한카드 Mastercard 브랜드만 프로모션 제공", "LG전자 구독요금 자동이체 시 제공", "월 1회, 최대 72개월간 제공"] },
        { minSpend: "70만원 이상", directDiscount: "16,000원", pointAccrual: "10,000포인트", promoDiscount: "1,000원", total: "17,000 ~ 27,000원" },
        { minSpend: "130만원 이상", directDiscount: "20,000원", pointAccrual: "10,000포인트", promoDiscount: "1,000원", total: "20,000 ~ 30,000원" },
      ],
      tableNotes: ["* 포인트 적립 서비스는 LG전자 구독요금 할인 전 자동납부 이용금액 기준 1회 7만원 이상인 경우 적용(월 1회)"],
      excludedItems: [
        "무이자할부(슬림할부 등 부분 무이자 포함) 이용거래, 단기카드대출(현금서비스), 장기카드대출(카드론), 연회비, 각종 수수료/이자(할부수수료, 연체이자 등)",
        "기프트카드/ 선불카드 구매·충전금액, 지방세, 국세, 지방세외수입, 환경개선부담금, 4대보험(국민연금, 고용보험, 건강보험, 산재보험)",
        "유치원/초중고 납입금(스쿨뱅킹), 대학(원)등록금, 아파트관리비, 도시가스, 전기요금, TV수신료, 수도요금",
        "상품권/선불전자지급수단 구매·충전금액, 포인트/캐시/사이버머니/예치금 등 전자지급(결제)수단 구매·충전금액, 거래 취소금액",
      ],
    },
    notes: [
      "연회비 : 국내전용 22,000원/ 해외겸용 25,000원 프로모션 혜택은 해외겸용(Mastercard)카드만 적용됩니다. (국내전용 카드는 프로모션 혜택 미적용 되며, 신한카드 홈페이지를 통해 신청 가능합니다.)",
      "전월 이용금액은 'LG전자 The 구독케어 신한카드'의 전월(1일~말일) 거래 시점 이용금액(일시불+할부)을 기준으로 반영됩니다.",
      "'LG전자 The 구독케어 신한카드' 최초 신규 발급 회원은 카드 사용 등록한 월의 다음달 등록월+1개월까지 전월 이용금액 30만원 이상 70만원 미만 구간의 서비스가 적용됩니다.",
      "거래 후 취소금액은 국내 거래의 경우 최초 승인된 달의 이용금액에서, 해외 거래의 경우 취소 전표가 매입된 달의 이용금액에서 차감됩니다.",
      "'결제일 할인 및 포인트 적립 혜택'은 신한카드에서 제공합니다.",
      "카드 혜택 등 관련 문의사항은 신한카드 고객센터(1544-7000)로 문의하시기 바랍니다.",
      "LG전자는 신한카드(주)의 신용카드 모집 업무를 대리·중개합니다.",
      "LG전자는 다수의 여신전문금융회사를 대리하거나 중개합니다.",
      "LG전자는 신한카드(주)의 금융상품에 대해 계약 체결 권한이 없습니다.",
      "LG전자는 금융관계법령에 따라 신한카드(주)와 제휴 계약을 체결한 금융상품 판매대리·중개업자입니다.",
      "계약을 체결전, 연회비 등 상세 사항은 반드시 금융상품설명서 및 약관을 확인하시기 바랍니다.",
      "금융소비자는 금융소비자보호법 제19조 제1항에 따라 해당 금융상품 또는 서비스에 대하여설명받을 권리가 있습니다.",
      '연체이자율은 "회원별, 이용상품별 약정금리+최대 연3%, 법정 최고금리(연20%)이내"에서 적용됩니다.',
      "신용카드 발급이 부적정한 경우(개인신용평점 낮음, 연체(단기포함) 사유 발생 등), 카드발급이 제한될 수 있습니다.",
      "카드 이용대금과 이에 수반되는 모든 수수료는 고객님께서 지정하신 결제일에 상환하여야 합니다.",
      "상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정기간 신용카드 이용대금을 연체할 경우, 결제일이 도래하지 않은 모든 신용카드 이용대금을 변제할 의무가 발생할 수 있습니다.",
      "여신금융협회 심의필 제2026-C1h-05089호(2026.04.01~2027.03.31)",
    ],
  },
  {
    id: "lotte",
    company: "롯데카드",
    fullName: "[롯데] LG구독엔로카",
    minSpend: "160만원 이상",
    maxDiscount: "26,000원",
    officialUrl: "https://www.lottecard.co.kr",
    image: "/images/card/롯데카드.jpg",
    annualFee: { domestic: "20,000원", overseas: "20,000원", brand: "AMEX, Mastercard" },
    benefitPeriod: "2026.05.01~2026.05.31",
    tiers: [
      { spend: "40만원 이상 사용 시", discount: "월 최대 20,000원 할인" },
      { spend: "80만원 이상 사용 시", discount: "월 최대 23,000원 할인" },
      { spend: "160만원 이상 사용 시", discount: "월 최대 26,000원 할인" },
    ],
    detail: {
      targetCard: "LG구독엔로카 (AMEX)",
      period: "2026.05.01~2026.05.31",
      benefit: "이벤트 기간 내 대상 카드로 LG전자 구독 요금 자동이체 시 프로모션 혜택 제공",
      tableTitle: "결제일 할인 혜택",
      tableStyle: "simple",
      showAnnualFeeInDetail: true,
      tableRows: [
        { minSpend: "40만 원 이상", directDiscount: "13,000원", promoDiscount: "7,000원", total: "20,000원", remarks: ["LG구독엔로카 AMEX브랜드만 프로모션 제공", "LG전자 구독요금 자동이체 시 제공", "프로모션 혜택은 월 1회, 최대 72개월간 제공(자동이체 등록에 따라 차등적용됨)"] },
        { minSpend: "80만 원 이상", directDiscount: "18,000원", promoDiscount: "5,000원", total: "23,000원" },
        { minSpend: "160만 원 이상", directDiscount: "26,000원", promoDiscount: "-", total: "26,000원" },
      ],
      tableNotes: [
        "- 전월 실적 제외항목 : 현금서비스, 카드론, 수수료, 이자, 연회비, 케어솔루션 요금 자동이체, 아파트관리비, 국세, 지방세, 취소매출 등 자세한 내용은 홈페이지 상품공시실 및 상품안내장 참조",
        "※ 결제일 할인 시 자동이체 필수 (월 1회 할인)",
      ],
      excludedItems: [],
    },
    notes: [
      "'결제일 할인'은 LG전자가 아닌 카드사에서 할인됩니다. 요금 출금일에는 정상 요금이 출금되고, 카드 대금 결제일에 전월 실적(1일~말일)이 충족되면 할인됩니다.",
      "이벤트 관련 자세한 문의사항은 롯데카드 고객센터(1588-8100)로 연락하시기 바랍니다.",
      "해당 이벤트는 롯데카드 또는 제휴사 사정에 따라 사전고지 없이 종료되거나 변경될 수 있습니다.",
      "계약체결 전 금융상품설명서와 약관을 확인하시기 바랍니다.",
      "서비스 제공 업종은 롯데카드에 등록된 가맹점 업종을 기준으로 합니다.",
      "신용카드 발급이 부적정한 경우(개인신용평점 낮음 등) 카드발급이 제한될 수 있습니다.",
      "카드이용대금과 이에 수반되는 모든 수수료를 지정된 대금 결제일에 상환해야 합니다.",
      "금융소비자는 금소법 제19조제1항에따라 해당상품 또는 서비스에 대하여 설명을 받을 권리가 있습니다.",
      "LG전자는 롯데카드(주)의 신용카드 회원모집업무를 대리- 중개합니다.",
      "LG전자는 다수의 신용카드사를 대리하거나 중개합니다.",
      "LG전자는 롯데카드(주)로 부터 금융상품 계약체결권을 부여받지 않았으며, 신용카드 계약은 해당금융사와 직접 체결됩니다.",
      "LG전자는 금융관계법률에 따라 롯데카드(주)와 위탁계약을 체결한 금융상품판매대리- 중개업자입니다.",
      "상환능력에 비해 신용카드 사용액이 과도할 경우 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정기간 원리금을 연체할 경우, 모든 원리금을 변제할 의무가 발생할 수 있습니다.",
      "여신금융협회 심의필 제2025-C1h-11099호 (2025.07.30 ~ 2026.07.29)",
    ],
  },
  {
    id: "kb",
    company: "KB국민카드",
    fullName: "[KB국민] LG전자 KB국민",
    minSpend: "80만원 이상",
    maxDiscount: "22,000원",
    officialUrl: "https://card.kbcard.com/CXPRICAC0076.cms?mainCC=a&cooperationcode=04425&categoryCode=L0061&sGroupCode=1",
    image: "/images/card/KB국민카드.jpg",
    annualFee: { domestic: "15,000원", overseas: "15,000원" },
    benefitPeriod: "2026.05.01~2026.05.31",
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 17,000원 할인" },
      { spend: "80만원 이상 사용 시", discount: "월 최대 22,000원 할인" },
    ],
    detail: {
      period: "2026.05.01~2026.05.31",
      benefit: "이벤트 기간 내 대상카드로 LG전자 구독 요금 자동이체 시 프로모션 혜택 제공",
      tableTitle: "결제일 할인 혜택",
      tableStyle: "simple",
      promoMonthsLabel: "(60개월)",
      showAnnualFeeInDetail: true,
      tableRows: [
        { minSpend: "30만 원 이상", directDiscount: "10,000원", promoDiscount: "7,000원", total: "17,000원", remarks: ["LG전자 구독요금 자동이체 시 제공", "프로모션 혜택은 최대 60개월간 제공"] },
        { minSpend: "80만 원 이상", directDiscount: "15,000원", promoDiscount: "7,000원", total: "22,000원" },
      ],
      tableNotes: [
        "※ 라이트 할부 할인과 구독요금 할인은 중복 제공되지 않습니다.",
        "* 추가청구할인 혜택 제공기간 : 2026.6월 ~ 2031.8월(63개월 중 최대 60개월 제공)",
        "- 해당 카드는 발급 후 납부 정보를 해당 카드로 직접 등록/변경해야 청구할인 혜택을 받을 수 있습니다. (마이페이지 >구독 관리>계약 현황)",
      ],
      excludedItems: [],
    },
    notes: [
      "연체 이자율 : 회원별 / 이용상품별 정상이자율 +3%p, 최고 연 20% 이내",
      "카드 발급 후 직접 납부 정보를 해당 카드로 변경해야 청구할인 혜택을 받을 수 있습니다.",
      "카드 상품별 연회비 및 서비스 등에 관한 상세 사항은 각 카드사의 홈페이지를 참조 해 주시기 바랍니다.",
      "계약을 체결하기 전에 상품에 관한 상세한 사항은 각 카드사의 상품설명서 및 약관을 확인하시기 바랍니다.",
      "상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정기간 원리금을 연체할 경우, 모든 원리금을 변제할 의무가 발생할 수 있습니다.",
      "금융소비자는 금소법 제19조 제1항에 따라 해당 상품 또는 서비스에 대하여 설명 받을 권리가 있습니다.",
      "신용카드 발급이 부적정한 경우(연체금 보유, 개인신용평점 낮음 등) 카드 발급이 제한될 수 있습니다.",
      "카드 이용 대금과 이에 수반되는 모든 수수료를 지정된 대금 결제일에 상환합니다.",
      "LG전자는 KB국민카드의 신용카드 상품 판매 업무를 중개하고 있습니다.",
      "LG전자는 다수의 금융상품 직접판매업자를 대리하거나 중개합니다.",
      "LG전자는 KB국민카드의 금융상품에 대한 계약 체결 권한이 없습니다.",
      "LG전자는 금융관계법률에 따라 KB국민카드와 제휴 계약을 체결한 금융상품 판매대리 중개업자입니다.",
      "여신금융협회 심의필 : 제 2026-C1h-03718호(2026.03.19 ~ 2027.03.18)",
    ],
  },
  {
    id: "woori",
    company: "우리카드",
    fullName: "[우리] LG전자 우리카드",
    minSpend: "120만원 이상",
    maxDiscount: "24,000원",
    officialUrl: "https://www.wooricard.com",
    image: "/images/card/우리카드.jpg",
    annualFee: { domestic: "15,000원", overseas: "15,000원", brand: "Mastercard" },
    benefitPeriod: "2026.05.01~2026.05.31",
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 17,000원 할인" },
      { spend: "70만원 이상 사용 시", discount: "월 최대 22,000원 할인" },
      { spend: "120만원 이상 사용 시", discount: "월 최대 24,000원 할인" },
    ],
    detail: {
      targetCard: "LG전자 우리카드",
      period: "2026.05.01~2026.05.31",
      benefit: "이벤트 기간 내 대상카드로 LG전자 구독요금 자동납부 최초 결제 시 프로모션 혜택 제공",
      tableTitle: "LG전자 구독요금 및 장기할부 청구할인 서비스\n※ LG전자 구독요금 자동납부 시 제공",
      tableStyle: "simple",
      tableRows: [
        { minSpend: "30만 원 이상", directDiscount: "10,000원", promoDiscount: "7,000원", total: "17,000원", remarks: ["LG전자 구독요금 자동납부 또는 제품구매 장기할부(24/36개월) 필수", "※ 프로모션 혜택(72개월)은 LG전자 구독요금 자동납부 시 한정 적용"] },
        { minSpend: "70만 원 이상", directDiscount: "15,000원", promoDiscount: "7,000원", total: "22,000원" },
        { minSpend: "120만 원 이상", directDiscount: "20,000원", promoDiscount: "4,000원", total: "24,000원" },
      ],
      tableNotes: [
        "※ 구독요금 자동납부 최초 결제 고객 대상 추가할인",
        "- 프로모션 기간 : 2026.05.01~2026.05.31",
        "- 프로모션 혜택은 최대 72개월간 적용됩니다.",
        "- 전월 실적 제외항목 : LG전자 우리카드로 할인받은 구독요금 이용금액(해당 이용금액 전체), LG전자 장기할부 이용 금액, 아파트 관리비, 무이자할부금액 등",
      ],
      excludedItems: [],
    },
    notes: [
      "연회비 : 국내전용 15,000원 / 해외겸용(MasterCard) 15,000원",
      "상세혜택 및 이용조건은 계약체결 전 홈페이지(www.wooricard.com), 상품설명서 및 약관 등을 통해 확인하시기 바랍니다.",
      "신용카드 발급이 부적정한 경우(개인신용평점 낮음 등) 카드발급이 제한될 수 있습니다.",
      "카드이용대금과 이에 수반되는 모든 수수료를 지정된 대금결제일에 상환합니다.",
      "금융소비자는 금융소비자보호법 제19조제1항에 따라 해당상품 또는 서비스에 대하여 설명을 받을 권리가 있습니다.",
      "엘지전자(주)는 (주)우리카드의 신용카드 회원 모집업무를 대리·중개합니다.",
      "엘지전자(주)는 (주)우리카드를 포함한 다수의 금융회사를 대리·중개합니다.",
      "엘지전자(주)는 (주)우리카드의 금융상품에 대한 계약 체결 권한이 없습니다.",
      "엘지전자(주)는 금융관계법률에 따라 (주)우리카드와 제휴계약을 체결한 금융상품 판매대리·중개업자입니다.",
      "상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정 기간 원리금을 연체할 경우, 모든 원리금을 변제할 의무가 발생할 수 있습니다.",
      "여신금융협회 심의필 제 2025 – C1h – 10251호 (2025.07.16 ~ 2026.07.15)",
    ],
  },
  {
    id: "woori-platinum",
    company: "우리카드",
    label: "Platinum",
    fullName: "[우리] LG전자 우리카드",
    minSpend: "200만원 이상",
    maxDiscount: "42,000원",
    officialUrl: "https://m.wooricard.com/dcmw/yh1/crd/crd01/M1CRD101S02.do?recomNo=104169",
    image: "/images/card/우리카드(platinum).jpg",
    annualFee: { domestic: "25,000원", overseas: "25,000원", brand: "VISA" },
    benefitPeriod: "2026.05.01~2026.05.31",
    tiers: [
      { spend: "100만원 이상 사용 시", discount: "월 최대 35,000원 할인" },
      { spend: "150만원 이상 사용 시", discount: "월 최대 39,000원 할인" },
      { spend: "200만원 이상 사용 시", discount: "월 최대 42,000원 할인" },
    ],
    detail: {
      targetCard: "LG전자 Platinum 우리카드",
      period: "2026.05.01~2026.05.31",
      benefit: "이벤트 기간 내 대상카드로 LG전자 구독요금 자동납부 최초 결제 시 프로모션 혜택 제공",
      tableTitle: "LG전자 구독요금 및 장기할부 청구할인 서비스\n※ LG전자 구독요금 자동납부 시 제공",
      tableStyle: "simple",
      tableRows: [
        { minSpend: "100만 원 이상", directDiscount: "29,000원", promoDiscount: "6,000원", total: "35,000원", remarks: ["LG전자 구독요금 자동납부 필수"] },
        { minSpend: "150만 원 이상", directDiscount: "34,000원", promoDiscount: "5,000원", total: "39,000원" },
        { minSpend: "200만 원 이상", directDiscount: "40,000원", promoDiscount: "2,000원", total: "42,000원" },
      ],
      tableNotes: [
        "※ 구독요금 자동납부 최초 결제 고객 대상 추가할인",
        "- 프로모션 기간 : 2026.05.01~2026.05.31",
        "- 프로모션 혜택은 최대 72개월간 적용됩니다.",
        "- LG전자 Platinum 우리카드 프로모션 혜택은 LG전자 구독요금 자동납부 시에만 할인 적용됩니다.",
        "- 전월실적 제외항목 : 무이자할부금액, 정부지원금, 아파트 관리비, 대학(대학원)등록금, 국세, 지방세, 공공요금 등",
      ],
      excludedItems: [],
    },
    notes: [
      "연회비 : 국내전용 25,000원 / 해외겸용(VISA) 25,000원",
      "상세혜택 및 이용조건은 계약체결 전 홈페이지(www.wooricard.com), 상품설명서 및 약관 등을 통해 확인하시기 바랍니다.",
      "신용카드 발급이 부적정한 경우(개인신용평점 낮음 등) 카드발급이 제한될 수 있습니다.",
      "카드이용대금과 이에 수반되는 모든 수수료를 지정된 대금결제일에 상환합니다.",
      "금융소비자는 금융소비자보호법 제19조제1항에 따라 해당상품 또는 서비스에 대하여 설명을 받을 권리가 있습니다.",
      "엘지전자(주)는 (주)우리카드의 신용카드 회원 모집업무를 대리·중개합니다.",
      "엘지전자(주)는 (주)우리카드를 포함한 다수의 금융회사를 대리·중개합니다.",
      "엘지전자(주)는 (주)우리카드의 금융상품에 대한 계약 체결 권한이 없습니다.",
      "엘지전자(주)는 금융관계법률에 따라 (주)우리카드와 제휴계약을 체결한 금융상품 판매대리·중개업자입니다.",
      "상환능력에 비해 신용카드 사용액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정 기간 원리금을 연체할 경우, 모든 원리금을 변제할 의무가 발생할 수 있습니다.",
      "여신금융협회 심의필 제 2026 - C1h - 02775호 (2026.03.03 ~ 2027.03.02)",
    ],
  },
  {
    id: "nh",
    company: "NH카드",
    fullName: "[NH] 올원 LG전자 BEST",
    minSpend: "100만원 이상",
    maxDiscount: "20,000원",
    officialUrl: "https://card.nonghyup.com/index_cardProd.html?SERVICE_ID=IPCC2111R&NAVIGATE_TYPE=1&wrs_tup_c=P21030&cd_wrs_sqno=90000369",
    image: "/images/card/농협카드.jpg",
    annualFee: { domestic: "15,000원", overseas: "17,000원", brand: "Mastercard" },
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 10,000원 할인" },
      { spend: "60만원 이상 사용 시", discount: "월 최대 15,000원 할인" },
      { spend: "100만원 이상 사용 시", discount: "월 최대 20,000원 할인" },
    ],
    detail: {
      features: ["카페/빵집을 자주 이용하는 고객에게 청구할인 혜택"],
      showAnnualFeeInDetail: true,
      tableTitle: "할인 혜택",
      tableStyle: "basic",
      tableRows: [
        { minSpend: "무실적 기간 (카드 사용등록월)", directDiscount: "10,000원", total: "10,000원" },
        { minSpend: "30만 원 이상", directDiscount: "10,000원", total: "10,000원" },
        { minSpend: "60만 원 이상", directDiscount: "15,000원", total: "15,000원" },
        { minSpend: "100만 원 이상", directDiscount: "20,000원", total: "20,000원" },
      ],
      tableNotes: [
        "- 전월 실적 제외항목 : 아파트관리비, 각종 세금, 공과금, 장기할부 할부금, 해외매출, 대학(원)등록금 현금 서비스, 카드론, 수수료, 이자, 연회비",
        "- 해당 카드는 발급 후 납부 정보를 해당 카드로 직접 등록/변경해야 청구할인 혜택을 받을 수 있습니다.",
      ],
      excludedItems: [],
    },
    notes: [
      "카드 혜택 등 관련 문의사항은 NH농협카드 고객센터(1644-4000)로 문의하시기 바랍니다.",
      "LG전자는 NH농협카드의 신용카드 모집 업무를 대리·중개합니다.",
    ],
  },
  {
    id: "hyundai",
    company: "현대카드",
    fullName: "[현대] LG전자 현대카드",
    minSpend: "120만원 이상",
    maxDiscount: "19,000원",
    officialUrl: "https://www.hyundaicard.com/m/lg_ed3l.html",
    image: "/images/card/현대카드.jpg",
    annualFee: { domestic: "20,000원", overseas: "20,000원", brand: "Visa Platinum" },
    tiers: [
      { spend: "40만원 이상 사용 시", discount: "월 최대 15,000원 청구 할인" },
      { spend: "80만원 이상 사용 시", discount: "월 최대 17,000원 청구 할인" },
      { spend: "120만원 이상 사용 시", discount: "월 최대 19,000원 청구 할인" },
    ],
    detail: {
      targetCard: "LG전자 현대카드 (Visa Platinum) 기소지 회원",
      period: "2026.05.01~2026.05.31",
      benefit: "기간 내 LG전자 현대카드로 LG전자 구독료 자동이체 시 전월 이용 금액에 따라 구독료 최대 60개월 간 1만 9000원 청구 할인",
      tableTitle: "결제일 할인 혜택",
      tableStyle: "simple",
      promoMonthsLabel: "(60개월)",
      tableRows: [
        { minSpend: "40만 원 이상", directDiscount: "8,000원", promoDiscount: "7,000원", total: "15,000원" },
        { minSpend: "80만 원 이상", directDiscount: "12,000원", promoDiscount: "5,000원", total: "17,000원" },
        { minSpend: "120만 원 이상", directDiscount: "16,000원", promoDiscount: "3,000원", total: "19,000원" },
      ],
      tableNotes: [
        "※ 전월 실적에 따라 혜택 제공",
        "※ 실적 조건 및 할인 한도, 혜택 제외 가맹점 기준 등 자세한 내용은 상품설명서를 통해 확인 가능",
        "- 청구 할인 적용된 구독료 정기결제 금액",
        "- 장기카드대출(카드론), 단기카드대출(현금서비스), 연회비, 제수수료, 이자",
        "- 공과금 납부액(국세, 관세, 지방세, 지방세외수입, 상하수도 요금, 벌과금, 과태료 등)",
      ],
      excludedItems: [],
    },
    notes: [
      "전월 이용 금액은 전월 1일~말일까지 LG전자 현대카드(본인+가족 카드)의 일시불 및 할부 이용 금액임",
      "전월 이용 금액 40만원 미만 시 청구 할인 제외",
      "구독료 정기결제 결제 건에 한해 혜택 적용 - 일반 납부 건, 정기결제일 이후 납부 건은 혜택 제외",
      "LG전자 구독료가 청구 할인 금액보다 적을 경우, 결제 금액만큼만 혜택 적용",
      "자세한 내용은 현대카드 홈페이지 참고",
      "LG전자는 현대카드의 신용카드 회원 모집 업무를 대리·중개합니다.",
      "LG전자는 다수의 신용카드사를 대리하거나 중개합니다.",
      "LG전자는 현대카드의 금융상품에 대한 계약체결권한이 없습니다.",
      "LG전자는 금융관계법률에 따라 현대카드와 위탁계약을 체결한 금융상품판매대리·중개업자입니다.",
      "상환 능력에 비해 신용카드 이용금액이 과도할 경우, 귀하의 개인신용평점이 하락할 수 있습니다.",
      "개인신용평점 하락 시 금융거래와 관련된 불이익이 발생할 수 있습니다.",
      "일정 기간 원리금을 연체할 경우, 모든 원리금을 변제할 의무가 발생할 수 있습니다.",
      "신용카드 발급이 부적정한 경우(연체금 보유, 개인신용평점 낮음 등) 카드 발급이 제한될 수 있습니다.",
      "여신금융협회 심의필 제2026-C1h-050303호(2026.04.14~2027.04.13)",
    ],
  },
  {
    id: "jeonbuk",
    company: "전북카드",
    fullName: "[전북] 베스트케어",
    minSpend: "100만원 이상",
    maxDiscount: "20,000원",
    officialUrl: "https://www.jbbank.co.kr/CRCD_SOCP_WMAN_01.act",
    image: "/images/card/전북카드.jpg",
    annualFee: { domestic: "14,000원", overseas: "15,000원", overseasLabel: "Mastercard" },
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 8,000원 할인" },
      { spend: "100만원 이상 사용 시", discount: "월 최대 20,000원 할인" },
    ],
    detail: {
      features: ["LG전자 구독 이용시, 월 최대 20,000원 청구할인 혜택"],
      showAnnualFeeInDetail: true,
      tableTitle: "할인 혜택",
      tableStyle: "basic",
      tableRows: [
        { minSpend: "무실적 기간 (카드 사용등록월)", directDiscount: "8,000원", total: "8,000원" },
        { minSpend: "30만 원 이상", directDiscount: "8,000원", total: "8,000원" },
        { minSpend: "100만 원 이상", directDiscount: "20,000원", total: "20,000원" },
      ],
      tableNotes: [
        "- 전월 실적 제외항목 : 무이자할부, 장/단기카드대출(카드론,현금서비스), 제세공과금, 국세, 지방세, 관세, 과태료, 건강보험, 국민연금, 고용보험, 아파트관리비, 대학교(대학원)등록금, 이자, 기프트/선불카드 구매 및 충전금액, 상품권 구매, 거래 취소 건, 연회비 등",
        "- 해당 카드는 발급 후 납부 정보를 해당 카드로 직접 등록/변경해야 청구할인 혜택을 받을 수 있습니다.",
      ],
      excludedItems: [],
    },
    notes: [
      "카드 혜택 등 관련 문의사항은 전북은행 고객센터(1588-4477)로 문의하시기 바랍니다.",
      "LG전자는 전북은행카드의 신용카드 모집 업무를 대리·중개합니다.",
    ],
  },
  {
    id: "gwangju",
    company: "광주카드",
    fullName: "[광주] 베스트케어",
    minSpend: "100만원 이상",
    maxDiscount: "20,000원",
    officialUrl: "https://m.kjbank.com/mweb/spa/goodsDetail/?pick=C019",
    image: "/images/card/광주카드.jpg",
    annualFee: { domestic: "14,000원", overseas: "15,000원", overseasLabel: "Mastercard" },
    tiers: [
      { spend: "30만원 이상 사용 시", discount: "월 최대 8,000원 할인" },
      { spend: "100만원 이상 사용 시", discount: "월 최대 20,000원 할인" },
    ],
    detail: {
      features: ["LG전자 구독 이용시, 월 최대 20,000원 청구할인 혜택"],
      showAnnualFeeInDetail: true,
      tableTitle: "할인 혜택",
      tableStyle: "basic",
      tableRows: [
        { minSpend: "무실적 기간 (카드 사용등록월)", directDiscount: "8,000원", total: "8,000원" },
        { minSpend: "30만 원 이상", directDiscount: "8,000원", total: "8,000원" },
        { minSpend: "100만 원 이상", directDiscount: "20,000원", total: "20,000원" },
      ],
      tableNotes: [
        "- 전월 실적 제외항목 : 무이자할부, 장/단기카드대출(카드론,현금서비스), 제세공과금, 국세, 지방세, 관세, 과태료, 건강보험, 국민연금, 고용보험, 아파트관리비, 대학교(대학원)등록금, 이자, 기프트/선불카드 구매 및 충전금액, 상품권 구매, 거래 취소 건, 연회비 등",
        "- 해당 카드는 발급 후 납부 정보를 해당 카드로 직접 등록/변경해야 청구할인 혜택을 받을 수 있습니다.",
      ],
      excludedItems: [],
    },
    notes: [
      "카드 혜택 등 관련 문의사항은 광주은행 고객센터(1588-3388)로 문의하시기 바랍니다.",
      "LG전자는 광주은행카드의 신용카드 모집 업무를 대리·중개합니다.",
    ],
  },
];

export const CARD_DETAIL_DEFAULTS: Record<string, CardDetailJson> = Object.fromEntries(
  CARD_DEFAULTS.map(({ id, image, ...rest }) => [id, rest])
);
