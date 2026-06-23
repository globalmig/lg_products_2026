import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM managers ORDER BY sort_order ASC")
    .all();
  return NextResponse.json(
    results.map((r: Record<string, unknown>) => ({
      ...r,
      tags: JSON.parse((r.tags as string) || "[]"),
    }))
  );
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const { id, img_key = "", name, store = "", tags = [], desc = "", href = "#", sort_order = 0 } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO managers (id, img_key, name, store, tags, desc, href, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, img_key, name, store, JSON.stringify(tags), desc, href, sort_order)
    .run();
  return NextResponse.json({ ok: true });
}
