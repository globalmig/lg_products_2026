import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { name, discount, image_key, sort_order, card_detail_json } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE card_discounts SET name=?, discount=?, image_key=?, sort_order=?, card_detail_json=? WHERE id=?")
    .bind(name, discount, image_key, sort_order, card_detail_json ?? null, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM card_discounts WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
