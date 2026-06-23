import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const body = await req.json() as { status?: string; memo?: string };
  if (body.status !== undefined) {
    await env.lg_product_db.prepare("UPDATE consult_submissions SET status=? WHERE id=?").bind(body.status, id).run();
  }
  if (body.memo !== undefined) {
    await env.lg_product_db.prepare("UPDATE consult_submissions SET memo=? WHERE id=?").bind(body.memo, id).run();
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM consult_submissions WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}
