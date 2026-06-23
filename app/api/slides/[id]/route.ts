import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { image_key, subtitle, title, sort_order } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE hero_slides SET image_key=?, subtitle=?, title=?, sort_order=? WHERE id=?")
    .bind(image_key, subtitle, title, sort_order, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM hero_slides WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
