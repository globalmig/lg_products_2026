import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


export async function GET() {
  const { env } = await getCloudflareContext();
  const row = await env.lg_product_db
    .prepare("SELECT * FROM feature_banner WHERE id=1")
    .first();
  return NextResponse.json(row);
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { image_key = "", subtitle = "", title = "", button_label = "", href = "" } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE feature_banner SET image_key=?, subtitle=?, title=?, button_label=?, href=? WHERE id=1")
    .bind(image_key, subtitle, title, button_label, href)
    .run();
  return NextResponse.json({ ok: true });
}
