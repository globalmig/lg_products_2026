import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";

type DBCategory = { id: string; section: string; name: string; sort_order: number };

function deserialize(row: DBCategory) {
  return { id: row.id, section: row.section, name: row.name, order: row.sort_order };
}

export async function GET(req: Request) {
  const { env } = await getCloudflareContext();
  const section = new URL(req.url).searchParams.get("section");
  const { results } = section
    ? await env.lg_product_db.prepare("SELECT * FROM product_categories WHERE section=? ORDER BY sort_order ASC").bind(section).all()
    : await env.lg_product_db.prepare("SELECT * FROM product_categories ORDER BY section, sort_order ASC").all();
  return NextResponse.json((results as DBCategory[]).map(deserialize));
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { section, items } = await req.json() as { section: string; items: { id: string; name: string; order: number }[] };
  await env.lg_product_db.prepare("DELETE FROM product_categories WHERE section=?").bind(section).run();
  if (items.length > 0) {
    const stmt = env.lg_product_db.prepare(
      "INSERT INTO product_categories (id, section, name, sort_order) VALUES (?, ?, ?, ?)"
    );
    await env.lg_product_db.batch(items.map((item, i) => stmt.bind(item.id, section, item.name, i)));
  }
  return NextResponse.json({ ok: true });
}
