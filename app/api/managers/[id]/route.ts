import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { id } = await params;
  const { img_key, name, store, tags, desc, href, sort_order } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE managers SET img_key=?, name=?, store=?, tags=?, desc=?, href=?, sort_order=? WHERE id=?")
    .bind(img_key, name, store, JSON.stringify(tags), desc, href, sort_order, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM managers WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
