import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { deserializeProduct, getAllProducts, getHiddenProductIds, getProductsBySection, toImageKey, HIDDEN_PRODUCT_IDS_KEY } from "@/lib/productsServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const includeHidden = searchParams.get("includeHidden") === "1";
  const products = section ? await getProductsBySection(section, includeHidden) : await getAllProducts(includeHidden);
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

// 여러 상품의 노출 on/off를 한 번의 읽기-수정-쓰기로 처리한다. 상품별로 PATCH를
// 동시에 여러 번 날리면 각 요청이 같은 site_settings 행을 따로 읽고 덮어써서
// 마지막에 끝난 요청만 반영되는 문제(lost update)가 있어, 반드시 이 엔드포인트로
// 한 번에 묶어 처리해야 한다.
export async function PATCH(req: Request) {
  const { env } = await getCloudflareContext();
  const { ids, isVisible } = (await req.json()) as { ids: string[]; isVisible: boolean };

  const hidden = await getHiddenProductIds(env);
  for (const id of ids) {
    if (isVisible) hidden.delete(id);
    else hidden.add(id);
  }

  await env.lg_product_db
    .prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .bind(HIDDEN_PRODUCT_IDS_KEY, JSON.stringify([...hidden]))
    .run();

  return NextResponse.json({ ok: true });
}
