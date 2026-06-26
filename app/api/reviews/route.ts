import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM reviews ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { id, stars = 5, image_key = "", content = "", name = "", product = "", date = "", sort_order = 0 } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO reviews (id, stars, image_key, content, name, product, date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, stars, image_key, content, name, product, date, sort_order)
    .run();
  return NextResponse.json({ ok: true });
}
