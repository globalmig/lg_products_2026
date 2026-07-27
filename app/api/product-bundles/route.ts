import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { PRODUCT_BUNDLES_KEY, type ProductBundle } from "@/lib/productBundles";

export async function GET() {
  const { env } = await getCloudflareContext();
  const row = await env.lg_product_db
    .prepare("SELECT value FROM site_settings WHERE key=?")
    .bind(PRODUCT_BUNDLES_KEY)
    .first<{ value: string }>();
  const bundles: ProductBundle[] = row?.value ? JSON.parse(row.value) : [];
  return NextResponse.json(bundles);
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { items } = (await req.json()) as { items: ProductBundle[] };
  await env.lg_product_db
    .prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .bind(PRODUCT_BUNDLES_KEY, JSON.stringify(items))
    .run();
  return NextResponse.json({ ok: true });
}
