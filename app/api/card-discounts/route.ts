import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM card_discounts ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { id, name, discount, image_key = "", sort_order = 0 } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO card_discounts (id, name, discount, image_key, sort_order) VALUES (?, ?, ?, ?, ?)")
    .bind(id, name, discount, image_key, sort_order)
    .run();
  return NextResponse.json({ ok: true });
}
