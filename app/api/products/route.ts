import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { deserializeProduct, getAllProducts, getProductsBySection, toImageKey } from "@/lib/productsServer";

export async function GET(req: Request) {
  const section = new URL(req.url).searchParams.get("section");
  const products = section ? await getProductsBySection(section) : await getAllProducts();
  return NextResponse.json(products);
}

export async function PUT(req: Request) {
  const { env } = await getCloudflareContext();
  const { section, items } = await req.json() as { section: string; items: ReturnType<typeof deserializeProduct>[] };
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
        const monthlyPrice = item.monthlyPrice;
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
