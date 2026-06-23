import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM event_products WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
