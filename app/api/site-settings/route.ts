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

export interface NewsEventContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  period: string;
  target: string;
  heroImageKey: string;
  heroImageKeyMobile: string;
  steps: NewsEventStep[];
  prizes: NewsEventPrize[];
  prizeNote: string;
}

export interface ReviewVisibility {
  home: boolean;
  newsEvent: boolean;
}
export type ReviewVisibilityMap = Record<string, ReviewVisibility>;

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
  heroMobileImages: Record<string, string>;
  reviewVisibility: ReviewVisibilityMap;
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
  heroImageKey: "",
  heroImageKeyMobile: "",
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
  heroMobileImages: {},
  reviewVisibility: {},
};

const KEY_MAP: Record<keyof Omit<SiteSettings, "footerInfo" | "consultBanner" | "channelIcons" | "newsEvent" | "eventBanner" | "heroMobileImages" | "reviewVisibility">, string> = {
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
      heroMobileImages: map["hero_mobile_images"] ? JSON.parse(map["hero_mobile_images"]) : DEFAULTS.heroMobileImages,
      reviewVisibility: map["review_visibility"] ? JSON.parse(map["review_visibility"]) : DEFAULTS.reviewVisibility,
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
  if (body.heroMobileImages !== undefined) updates.push(["hero_mobile_images", JSON.stringify(body.heroMobileImages)]);
  if (body.reviewVisibility !== undefined) updates.push(["review_visibility", JSON.stringify(body.reviewVisibility)]);

  if (updates.length === 0) return NextResponse.json({ ok: true });

  const stmt = env.lg_product_db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  await env.lg_product_db.batch(updates.map(([k, v]) => stmt.bind(k, v)));
  return NextResponse.json({ ok: true });
}
