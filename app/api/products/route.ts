import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


type DBProduct = {
  id: string; section: string; category: string; name: string; model: string;
  monthly_price: number; benefit_price: number | null; tags: string;
  image: string; detail_image: string; is_best: number; sort_order: number;
};

function deserialize(row: DBProduct) {
  return {
    id: row.id, section: row.section, category: row.category,
    name: row.name, model: row.model,
    monthlyPrice: row.monthly_price, benefitPrice: row.benefit_price,
    tags: JSON.parse(row.tags || "[]"),
    image: row.image, detailImage: row.detail_image ?? "",
    isBest: row.is_best === 1, order: row.sort_order,
  };
}

export async function GET(req: Request) {
  const { env } = await getCloudflareContext();
  const section = new URL(req.url).searchParams.get("section");
  const { results } = section
    ? await env.lg_product_db.prepare("SELECT * FROM products WHERE section=? ORDER BY sort_order ASC").bind(section).all()
    : await env.lg_product_db.prepare("SELECT * FROM products ORDER BY section, sort_order ASC").all();
  return NextResponse.json((results as DBProduct[]).map(deserialize));
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { section, items } = await req.json() as { section: string; items: ReturnType<typeof deserialize>[] };
  await env.lg_product_db.prepare("DELETE FROM products WHERE section=?").bind(section).run();
  if (items.length > 0) {
    const stmt = env.lg_product_db.prepare(
      "INSERT INTO products (id, section, category, name, model, monthly_price, benefit_price, tags, image, detail_image, is_best, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    await env.lg_product_db.batch(
      items.map((item, i) => stmt.bind(
        item.id, section, item.category, item.name, item.model,
        item.monthlyPrice, item.benefitPrice ?? null, JSON.stringify(item.tags),
        item.image, item.detailImage ?? "",
        item.isBest ? 1 : 0, i
      ))
    );
  }
  return NextResponse.json({ ok: true });
}
