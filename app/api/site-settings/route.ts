import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export interface SiteSettings {
  storeName: string;
  copyright: string;
}

const DEFAULTS: SiteSettings = {
  storeName: "용산전자상가점",
  copyright: "© 2025 LG Electronics Inc. All rights reserved.",
};

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const { results } = await env.lg_product_db
      .prepare("SELECT key, value FROM site_settings")
      .all<{ key: string; value: string }>();
    const map = Object.fromEntries(results.map((r) => [r.key, r.value]));
    return NextResponse.json({
      storeName: map["store_name"] ?? DEFAULTS.storeName,
      copyright: map["copyright"] ?? DEFAULTS.copyright,
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const body = await req.json() as Partial<SiteSettings>;
  const updates: [string, string][] = [];
  if (body.storeName !== undefined) updates.push(["store_name", body.storeName]);
  if (body.copyright !== undefined) updates.push(["copyright", body.copyright]);

  const stmt = env.lg_product_db.prepare(
    "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
  );
  await env.lg_product_db.batch(updates.map(([k, v]) => stmt.bind(k, v)));
  return NextResponse.json({ ok: true });
}
