import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM product_categories WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
