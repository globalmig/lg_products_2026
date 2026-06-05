export type KitchenProduct = {
  id: number;
  category: string;
  name: string;
  model: string;
  monthlyPrice: number;
  benefitPrice: number | null;
  tags: { label: string; type: "hot" | "naver" | "default" }[];
  image: string;
};

export const kitchenCategories = [
  "냉장고",
  "김치냉장고",
  "식기세척기",
  "전기레인지",
  "광파오븐",
  "Fit & Max",
  "Fit & Max(냉장고+김치냉장고)",
  "컨버터블",
];

export const kitchenProducts: KitchenProduct[] = [
  {
    id: 1,
    category: "냉장고",
    name: "LG 일반냉장고 오브제컬렉션 렌탈 가전 구독",
    model: "D463MHH33",
    monthlyPrice: 17900,
    benefitPrice: 0,
    tags: [],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 2,
    category: "김치냉장고",
    name: "LG 디오스 AI 오브제컬렉션 김치톡톡 렌탈 가전 구독",
    model: "Z495MQQ212",
    monthlyPrice: 56900,
    benefitPrice: 14900,
    tags: [
      { label: "HOT TREND", type: "hot" },
      { label: "네이버페이 35만원", type: "naver" },
    ],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 3,
    category: "Fit & Max(냉장고+김치냉장고)",
    name: "LG 냉장고 + 김치톡톡 + QNED TV 세트 렌탈 가전 구독",
    model: "T875MEE111+Z408MEEF23+75QNED75AEA",
    monthlyPrice: 131300,
    benefitPrice: 101300,
    tags: [
      { label: "HOT TREND", type: "hot" },
      { label: "네이버페이 40만원", type: "naver" },
    ],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 4,
    category: "냉장고",
    name: "LG 디오스 오브제컬렉션 매직스페이스 냉장고 렌탈 가전 구독",
    model: "T875MHR111",
    monthlyPrice: 49900,
    benefitPrice: 7900,
    tags: [{ label: "네이버페이 10만원", type: "naver" }],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 5,
    category: "식기세척기",
    name: "LG 디오스 오브제컬렉션 식기세척기 렌탈 가전 구독",
    model: "DFB22WQAP",
    monthlyPrice: 23900,
    benefitPrice: 5900,
    tags: [{ label: "네이버페이 5만원", type: "naver" }],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 6,
    category: "전기레인지",
    name: "LG 디오스 인덕션 전기레인지 렌탈 가전 구독",
    model: "BEI3MT1",
    monthlyPrice: 18900,
    benefitPrice: 3900,
    tags: [],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 7,
    category: "광파오븐",
    name: "LG 광파오븐 렌탈 가전 구독",
    model: "MH7295QDS",
    monthlyPrice: 19900,
    benefitPrice: 4900,
    tags: [],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 8,
    category: "컨버터블",
    name: "LG 디오스 컨버터블 패키지 렌탈 가전 구독",
    model: "F328S75",
    monthlyPrice: 34900,
    benefitPrice: 12900,
    tags: [{ label: "네이버페이 8만원", type: "naver" }],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 9,
    category: "Fit & Max",
    name: "LG 디오스 오브제컬렉션 Fit & Max 냉장고 렌탈 가전 구독",
    model: "M874SSS042",
    monthlyPrice: 62900,
    benefitPrice: 22900,
    tags: [{ label: "HOT TREND", type: "hot" }],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 10,
    category: "냉장고",
    name: "LG 디오스 오브제컬렉션 무드업 냉장고 렌탈 가전 구독",
    model: "T873MEE111",
    monthlyPrice: 42900,
    benefitPrice: 12900,
    tags: [{ label: "네이버페이 12만원", type: "naver" }],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 11,
    category: "김치냉장고",
    name: "LG 디오스 오브제컬렉션 김치냉장고 렌탈 가전 구독",
    model: "Z402MEE153",
    monthlyPrice: 28900,
    benefitPrice: 8900,
    tags: [],
    image: "/images/icon/3D/box.png",
  },
  {
    id: 12,
    category: "식기세척기",
    name: "LG 디오스 스팀 식기세척기 렌탈 가전 구독",
    model: "DFB512FP",
    monthlyPrice: 29900,
    benefitPrice: 9900,
    tags: [{ label: "HOT TREND", type: "hot" }],
    image: "/images/icon/3D/box.png",
  },
];
