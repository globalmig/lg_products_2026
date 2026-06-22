import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const { env } = getRequestContext<CloudflareEnv>();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM event_products ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { id, product_id, sort_order = 0 } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO event_products (id, product_id, sort_order) VALUES (?, ?, ?)")
    .bind(id, product_id, sort_order)
    .run();
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const items: { id: string; product_id: string; sort_order: number }[] = await req.json();
  await env.lg_product_db.batch(
    items.map((item, i) =>
      env.lg_product_db
        .prepare("INSERT OR REPLACE INTO event_products (id, product_id, sort_order) VALUES (?, ?, ?)")
        .bind(item.id, item.product_id, i)
    )
  );
  return NextResponse.json({ ok: true });
}
