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

export interface SiteSettings {
  storeName: string;
  copyright: string;
  privacyContent: string;
  termsContent: string;
  footerInfo: FooterInfoItem[];
  consultBanner: ConsultBanner;
}

const DEFAULT_CONSULT_BANNER: ConsultBanner = {
  badge: "주주 상담",
  title: "지금 바로 상담을 신청하세요",
  desc: "전담 매니저가 빠르게 연락드립니다. 방문 없이 집에서 편리하게.",
  buttonText: "지금 바로 상담 예약",
  buttonHref: "/consult",
};

const DEFAULTS: SiteSettings = {
  storeName: "용산전자상가점",
  copyright: "© 2026 LG Electronics Inc. All rights reserved.",
  privacyContent: "",
  termsContent: "",
  footerInfo: [],
  consultBanner: DEFAULT_CONSULT_BANNER,
};

const KEY_MAP: Record<keyof Omit<SiteSettings, "footerInfo" | "consultBanner">, string> = {
  storeName: "store_name",
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
      copyright: map["copyright"] ?? DEFAULTS.copyright,
      privacyContent: map["privacy_content"] ?? DEFAULTS.privacyContent,
      termsContent: map["terms_content"] ?? DEFAULTS.termsContent,
      footerInfo: map["footer_info"] ? JSON.parse(map["footer_info"]) : DEFAULTS.footerInfo,
      consultBanner: map["consult_banner"] ? JSON.parse(map["consult_banner"]) : DEFAULTS.consultBanner,
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

  if (updates.length === 0) return NextResponse.json({ ok: true });

  const stmt = env.lg_product_db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  await env.lg_product_db.batch(updates.map(([k, v]) => stmt.bind(k, v)));
  return NextResponse.json({ ok: true });
}
