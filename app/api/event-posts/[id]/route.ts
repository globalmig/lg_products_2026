import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { title, subtitle, image_key, link, sort_order } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE event_posts SET title=?, subtitle=?, image_key=?, link=?, sort_order=? WHERE id=?")
    .bind(title, subtitle, image_key, link, sort_order, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const row = await env.lg_product_db
    .prepare("SELECT image_key FROM event_posts WHERE id=?")
    .bind(id)
    .first<{ image_key: string }>();
  if (row?.image_key) {
    await env.lg_product_images.delete(row.image_key);
  }
  await env.lg_product_db.prepare("DELETE FROM event_posts WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
