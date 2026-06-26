import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM event_posts ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { id, title = "", subtitle = "", image_key = "", link = "", sort_order = 0, created_at = "" } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO event_posts (id, title, subtitle, image_key, link, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, title, subtitle, image_key, link, sort_order, created_at)
    .run();
  return NextResponse.json({ ok: true });
}
