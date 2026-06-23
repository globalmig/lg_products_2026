import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM main_categories ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { id, label, href = "", image = "", bg = "", sort_order = 0 } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO main_categories (id, label, href, image, bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, label, href, image, bg, sort_order)
    .run();
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const items: { id: string; label: string; href: string; image: string; bg: string; sort_order: number }[] = await req.json();
  const stmt = env.lg_product_db.prepare(
    "INSERT OR REPLACE INTO main_categories (id, label, href, image, bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  );
  await env.lg_product_db.batch(
    items.map((item) => stmt.bind(item.id, item.label, item.href, item.image, item.bg, item.sort_order))
  );
  return NextResponse.json({ ok: true });
}
