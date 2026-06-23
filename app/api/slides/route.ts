import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM hero_slides ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { image_key = "", subtitle = "", title = "", sort_order = 0 } = await req.json();
  const result = await env.lg_product_db
    .prepare("INSERT INTO hero_slides (image_key, subtitle, title, sort_order) VALUES (?, ?, ?, ?)")
    .bind(image_key, subtitle, title, sort_order)
    .run();
  return NextResponse.json({ id: result.meta.last_row_id });
}
