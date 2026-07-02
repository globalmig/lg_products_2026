import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export interface FooterInfoItem {
  id: string;
  label: string;
  value: string;
}

export interface ConsultBanner {
  badge: string;
  title: string;
  desc: string;
  buttonText: string;
  buttonHref: string;
}

export interface EventBanner {
  badge: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ChannelIcon {
  id: string;
  label: string;
  imageKey: string;
  href: string;
  primary: boolean;
}

export interface NewsEventStep {
  title: string;
  desc: string;
}

export interface NewsEventPrize {
  rank: string;
  count: string;
  name: string;
  value: string;
  highlight: boolean;
}

export interface NewsEventReview {
  id: string;
  stars: number;
  image_key: string;
  content: string;
  name: string;
  product: string;
  date: string;
  sort_order: number;
}

export interface NewsEventContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  period: string;
  target: string;
  steps: NewsEventStep[];
  prizes: NewsEventPrize[];
  prizeNote: string;
  reviews: NewsEventReview[];
}

export interface SiteSettings {
  storeName: string;
  storeNameMobile: string;
  copyright: string;
  privacyContent: string;
  termsContent: string;
  footerInfo: FooterInfoItem[];
  consultBanner: ConsultBanner;
  channelIcons: ChannelIcon[];
  newsEvent: NewsEventContent;
  eventBanner: EventBanner;
}

const DEFAULT_CONSULT_BANNER: ConsultBanner = {
  badge: "주주 상담",
  title: "지금 바로 상담을 신청하세요",
  desc: "전담 매니저가 빠르게 연락드립니다. 방문 없이 집에서 편리하게.",
  buttonText: "지금 바로 상담 예약",
  buttonHref: "/consult",
};

const DEFAULT_EVENT_BANNER: EventBanner = {
  badge: "이달의 행사",
  title: "이달의 행사 진행 중 🎉",
  description: "이달의 특별 할인 혜택을 놓치지 마세요",
  buttonLabel: "혜택 확인하기 →",
  buttonHref: "/benefit",
};

const DEFAULT_CHANNEL_ICONS: ChannelIcon[] = [
  { id: "1", label: "상담 신청", imageKey: "/images/main/btn/reservation-1.png", href: "/consult", primary: true },
  { id: "2", label: "카카오톡 상담", imageKey: "/images/main/btn/kakaotalk.png", href: "https://pf.kakao.com/_xnMRRX", primary: false },
  { id: "3", label: "인스타그램", imageKey: "/images/main/btn/insta.png", href: "https://www.instagram.com/lgebestshop_yongsan", primary: false },
  { id: "4", label: "블로그", imageKey: "/images/main/btn/blog.png", href: "https://blog.naver.com/lg_yongsan", primary: false },
];

const DEFAULT_NEWS_EVENT: NewsEventContent = {
  badge: "2026년 6월 리뷰 이벤트",
  titleLine1: "후기 남기고",
  titleLine2: "경품 받아가세요",
  description: "LG전자 베스트샵 용산점에서 구독·구매 후 네이버 지도 리뷰를 작성하시면 추첨을 통해 경품을 드립니다.",
  period: "2026.06.01 – 06.30",
  target: "구독·구매 완료 고객",
  steps: [
    { title: "구독 or 구매 상담", desc: "매장 방문 또는 온라인으로 상담 후 제품을 구독·구매하세요." },
    { title: "네이버 지도 리뷰 작성", desc: "LG전자 베스트샵 용산점 네이버 지도 페이지에 별점 5점 + 50자 이상 후기를 남겨주세요." },
    { title: "리뷰 캡처 제출", desc: "작성한 리뷰 화면을 캡처하여 카카오톡 채널 또는 상담 신청 폼으로 전송해주세요." },
    { title: "경품 수령", desc: "확인 후 영업일 3일 이내 문자로 경품 발송 안내드립니다." },
  ],
  prizes: [
    { rank: "1등", count: "매월 2명", name: "스타벅스 아메리카노\n10잔 쿠폰", value: "60,000원 상당", highlight: true },
    { rank: "2등", count: "매월 5명", name: "편의점 상품권", value: "20,000원", highlight: false },
    { rank: "참여 전원", count: "선착순 30명", name: "스타벅스 아메리카노\n1잔 쿠폰", value: "6,000원 상당", highlight: false },
  ],
  prizeNote: "※ 당첨자 발표는 매월 초 개별 문자 발송 / 경품은 변경될 수 있습니다.",
  reviews: [
    { id: "nr1", stars: 5, image_key: "", content: "상담부터 설치까지 꼼꼼하게 챙겨주셔서 정말 만족스러웠어요. 제품도 생각보다 훨씬 조용하고 공간 활용이 좋네요. 매니저님이 색상 조합까지 같이 고민해줘서 인테리어에도 딱 맞게 선택했습니다.", name: "김*현", product: "LG 디오스 오브제컬렉션 냉장고", date: "2026.05.18", sort_order: 0 },
    { id: "nr2", stars: 5, image_key: "", content: "구독 서비스가 이렇게 편할 줄 몰랐어요. 설치도 빠르고 관리까지 해준다니 너무 좋아요. 용산점 매니저분이 실제 사용 팁도 알려주셔서 처음 사용하는 데 전혀 어렵지 않았습니다.", name: "박*은", product: "LG 워시타워 렌탈 가전 구독", date: "2026.05.12", sort_order: 1 },
    { id: "nr3", stars: 5, image_key: "", content: "혼자 사는데 거실에 두기 딱 좋은 사이즈예요. 가격 대비 화질이 정말 좋고, 배터리로 어디서나 볼 수 있어서 활용도가 높아요. 매장에서 직접 비교하고 구매할 수 있어서 좋았습니다.", name: "이*준", product: "LG 스탠바이미 2 렌탈 가전 구독", date: "2026.04.29", sort_order: 2 },
  ],
};

const DEFAULTS: SiteSettings = {
  storeName: "용산전자상가점",
  storeNameMobile: "",
  copyright: "© 2026 LG Electronics Inc. All rights reserved.",
  privacyContent: "",
  termsContent: "",
  footerInfo: [],
  consultBanner: DEFAULT_CONSULT_BANNER,
  channelIcons: DEFAULT_CHANNEL_ICONS,
  newsEvent: DEFAULT_NEWS_EVENT,
  eventBanner: DEFAULT_EVENT_BANNER,
};

const KEY_MAP: Record<keyof Omit<SiteSettings, "footerInfo" | "consultBanner" | "channelIcons" | "newsEvent" | "eventBanner">, string> = {
  storeName: "store_name",
  storeNameMobile: "store_name_mobile",
  copyright: "copyright",
  privacyContent: "privacy_content",
  termsContent: "terms_content",
};

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const { results } = await env.lg_product_db.prepare("SELECT key, value FROM site_settings").all<{ key: string; value: string }>();
    const map = Object.fromEntries(results.map((r) => [r.key, r.value]));
    return NextResponse.json({
      storeName: map["store_name"] ?? DEFAULTS.storeName,
      storeNameMobile: map["store_name_mobile"] ?? DEFAULTS.storeNameMobile,
      copyright: map["copyright"] ?? DEFAULTS.copyright,
      privacyContent: map["privacy_content"] ?? DEFAULTS.privacyContent,
      termsContent: map["terms_content"] ?? DEFAULTS.termsContent,
      footerInfo: map["footer_info"] ? JSON.parse(map["footer_info"]) : DEFAULTS.footerInfo,
      consultBanner: map["consult_banner"] ? JSON.parse(map["consult_banner"]) : DEFAULTS.consultBanner,
      channelIcons: map["channel_icons"] ? JSON.parse(map["channel_icons"]) : DEFAULTS.channelIcons,
      newsEvent: map["news_event"] ? JSON.parse(map["news_event"]) : DEFAULTS.newsEvent,
      eventBanner: map["event_banner"] ? JSON.parse(map["event_banner"]) : DEFAULTS.eventBanner,
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const body = (await req.json()) as Partial<SiteSettings>;

  const updates: [string, string][] = [];
  (Object.keys(KEY_MAP) as (keyof typeof KEY_MAP)[]).forEach((k) => {
    if (body[k] !== undefined) updates.push([KEY_MAP[k], body[k] as string]);
  });
  if (body.footerInfo !== undefined) updates.push(["footer_info", JSON.stringify(body.footerInfo)]);
  if (body.consultBanner !== undefined) updates.push(["consult_banner", JSON.stringify(body.consultBanner)]);
  if (body.channelIcons !== undefined) updates.push(["channel_icons", JSON.stringify(body.channelIcons)]);
  if (body.newsEvent !== undefined) updates.push(["news_event", JSON.stringify(body.newsEvent)]);
  if (body.eventBanner !== undefined) updates.push(["event_banner", JSON.stringify(body.eventBanner)]);

  if (updates.length === 0) return NextResponse.json({ ok: true });

  const stmt = env.lg_product_db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  await env.lg_product_db.batch(updates.map(([k, v]) => stmt.bind(k, v)));
  return NextResponse.json({ ok: true });
}
