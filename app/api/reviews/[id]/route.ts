import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { stars, image_key, content, name, product, date, sort_order } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE reviews SET stars=?, image_key=?, content=?, name=?, product=?, date=?, sort_order=? WHERE id=?")
    .bind(stars, image_key, content, name, product, date, sort_order, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM reviews WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
