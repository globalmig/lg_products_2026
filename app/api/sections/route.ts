import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


type DBSection = { id: string; label: string; sort_order: number };

const SLUG_RE = /^[a-z0-9-]{1,30}$/;

function deserialize(row: DBSection) {
  return { id: row.id, label: row.label, order: row.sort_order };
}

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db.prepare("SELECT * FROM sections ORDER BY sort_order ASC").all();
  return NextResponse.json((results as DBSection[]).map(deserialize));
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { items } = await req.json() as { items: { id: string; label: string; order: number }[] };
  if (items.some((item) => !SLUG_RE.test(item.id))) {
    return NextResponse.json({ error: "잘못된 URL 슬러그입니다." }, { status: 400 });
  }
  await env.lg_product_db.prepare("DELETE FROM sections").run();
  if (items.length > 0) {
    const stmt = env.lg_product_db.prepare(
      "INSERT INTO sections (id, label, sort_order) VALUES (?, ?, ?)"
    );
    await env.lg_product_db.batch(items.map((item, i) => stmt.bind(item.id, item.label, i)));
  }
  return NextResponse.json({ ok: true });
}
