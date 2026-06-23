import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const row = await env.lg_product_db
    .prepare("SELECT * FROM posts WHERE id=?")
    .bind(id)
    .first();
  if (!row) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { title, content } = await req.json();
  await env.lg_product_db
    .prepare("UPDATE posts SET title=?, content=? WHERE id=?")
    .bind(title, content, id)
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db
    .prepare("DELETE FROM posts WHERE id=?")
    .bind(id)
    .run();
  return NextResponse.json({ ok: true });
}
