import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";


type DBProduct = {
  id: string; section: string; category: string; name: string; model: string;
  monthly_price: number; benefit_price: number | null; tags: string;
  image: string; detail_image: string; is_best: number; sort_order: number;
  price_60: number | null; price_48: number | null; price_36: number | null;
  care_service: string; manage_cycle: string; color: string; size: string;
  period_prices: string; care_service_items: string; color_items: string;
};

function toImageUrl(key: string) {
  if (!key || key.startsWith("/") || key.startsWith("http") || key.trimStart().startsWith("<")) return key;
  return `/api/images/${key}`;
}

function toImageKey(url: string) {
  if (!url) return url;
  if (url.startsWith("/api/images/")) return url.slice("/api/images/".length);
  return url;
}

function deserialize(row: DBProduct) {
  const rawColorItems = JSON.parse(row.color_items || "[]") as { name: string; image: string }[];
  return {
    id: row.id, section: row.section, category: row.category,
    name: row.name, model: row.model,
    monthlyPrice: row.monthly_price, benefitPrice: row.benefit_price,
    price60: row.price_60 ?? null, price48: row.price_48 ?? null, price36: row.price_36 ?? null,
    periodPrices: JSON.parse(row.period_prices || "[]"),
    careServiceItems: JSON.parse(row.care_service_items || "[]"),
    colorItems: rawColorItems.map((c) => ({ ...c, image: toImageUrl(c.image) })),
    tags: JSON.parse(row.tags || "[]"),
    image: toImageUrl(row.image), detailImage: toImageUrl(row.detail_image ?? ""),
    isBest: row.is_best === 1, order: row.sort_order,
    careService: row.care_service ?? "", manageCycle: row.manage_cycle ?? "",
    color: row.color ?? "", size: row.size ?? "",
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
      "INSERT INTO products (id, section, category, name, model, monthly_price, benefit_price, price_60, price_48, price_36, tags, image, detail_image, is_best, sort_order, care_service, manage_cycle, color, size, period_prices, care_service_items, color_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    await env.lg_product_db.batch(
      items.map((item, i) => {
        const typedItem = item as typeof item & {
          price60?: number | null; price48?: number | null; price36?: number | null;
          periodPrices?: { label: string; price: number }[];
          careServiceItems?: { label: string; cycle: string }[];
          colorItems?: { name: string; image: string }[];
          careService?: string; manageCycle?: string; color?: string; size?: string;
        };
        const periodPrices = typedItem.periodPrices ?? [];
        const monthlyPrice = periodPrices[0]?.price ?? item.monthlyPrice;
        return stmt.bind(
          item.id, section, item.category, item.name, item.model,
          monthlyPrice, item.benefitPrice ?? null,
          typedItem.price60 ?? null,
          typedItem.price48 ?? null,
          typedItem.price36 ?? null,
          JSON.stringify(item.tags),
          toImageKey(item.image), toImageKey(item.detailImage ?? ""),
          item.isBest ? 1 : 0, i,
          typedItem.careService ?? "",
          typedItem.manageCycle ?? "",
          typedItem.color ?? "",
          typedItem.size ?? "",
          JSON.stringify(periodPrices),
          JSON.stringify(typedItem.careServiceItems ?? []),
          JSON.stringify((typedItem.colorItems ?? []).map((c) => ({ ...c, image: toImageKey(c.image) }))),
        );
      })
    );
  }
  return NextResponse.json({ ok: true });
}
