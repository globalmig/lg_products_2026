import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getHiddenProductIds, HIDDEN_PRODUCT_IDS_KEY } from "@/lib/productsServer";


export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  await env.lg_product_db.prepare("DELETE FROM products WHERE id=?").bind(id).run();
  return NextResponse.json({ ok: true });
}

// 노출 on/off 토글. products 테이블은 건드리지 않고 site_settings의 숨긴 상품 id
// 목록만 갱신하므로, 꺼도 상품 데이터 자체는 관리자 화면에 그대로 남는다.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const { id } = await params;
  const { isVisible } = (await req.json()) as { isVisible: boolean };

  const hidden = await getHiddenProductIds(env);
  if (isVisible) hidden.delete(id);
  else hidden.add(id);

  await env.lg_product_db
    .prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .bind(HIDDEN_PRODUCT_IDS_KEY, JSON.stringify([...hidden]))
    .run();

  return NextResponse.json({ ok: true });
}
