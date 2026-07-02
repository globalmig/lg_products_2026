import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

// 대소문자/구조를 우회한 <ScrIPt> 등 태그 삽입을 막기 위해 꺾쇠 문자 자체를 제거한다.
// (렌더링 시 React가 자동 이스케이프하지만, CSV 내보내기 등 다른 소비처를 위한 방어적 조치)
function sanitizeText(v: unknown): string {
  return typeof v === "string" ? v.replace(/[<>]/g, "").trim() : "";
}

function sanitizeProduct(p: unknown) {
  if (typeof p !== "object" || p === null) return null;
  const obj = p as Record<string, unknown>;
  const period = obj.selectedPeriodPrice as Record<string, unknown> | undefined;
  const care = obj.selectedCareService as Record<string, unknown> | undefined;
  const color = obj.selectedColor as Record<string, unknown> | undefined;
  const card = obj.selectedCard as Record<string, unknown> | undefined;
  return {
    id: sanitizeText(obj.id),
    name: sanitizeText(obj.name),
    model: sanitizeText(obj.model),
    image: sanitizeText(obj.image),
    selectedPeriodPrice: period
      ? { label: sanitizeText(period.label), price: Number(period.price) || 0 }
      : undefined,
    selectedCareService: care
      ? { label: sanitizeText(care.label), cycle: sanitizeText(care.cycle) }
      : undefined,
    selectedColor: color
      ? { name: sanitizeText(color.name), image: sanitizeText(color.image) }
      : undefined,
    selectedCard: card
      ? { name: sanitizeText(card.name), discount: Number(card.discount) || 0, image: sanitizeText(card.image) }
      : undefined,
  };
}

export async function GET() {
  const { env } = await getCloudflareContext();
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM consult_submissions ORDER BY submitted_at DESC")
    .all();
  return NextResponse.json(
    results.map((r: Record<string, unknown>) => ({
      ...r,
      channels: JSON.parse((r.channels as string) || "[]"),
      selectedProducts: JSON.parse((r.selected_products as string) || "[]"),
    }))
  );
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext();
  const body = await req.json() as Record<string, unknown>;
  const id = sanitizeText(body.id) || Date.now().toString();
  const name = sanitizeText(body.name);
  const phone = sanitizeText(body.phone);
  const submitted_at = sanitizeText(body.submitted_at) || new Date().toISOString();
  const status = ["new", "inProgress", "completed"].includes(body.status as string) ? (body.status as string) : "new";
  // legacy fields
  const purpose = sanitizeText(body.purpose);
  const area = sanitizeText(body.area);
  const apartment = sanitizeText(body.apartment);
  const channels = Array.isArray(body.channels) ? body.channels.map(sanitizeText) : [];
  const model = sanitizeText(body.model);
  // new subscription fields
  const selectedProducts = Array.isArray(body.selectedProducts)
    ? body.selectedProducts.map(sanitizeProduct).filter(Boolean)
    : [];
  const availableTime = sanitizeText(body.availableTime);
  const extra = sanitizeText(body.extra);

  await env.lg_product_db
    .prepare(
      "INSERT INTO consult_submissions (id, name, phone, purpose, area, apartment, channels, model, submitted_at, status, selected_products, care_type, available_time, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, name, phone, purpose, area, apartment, JSON.stringify(channels), model, submitted_at, status, JSON.stringify(selectedProducts), "", availableTime, extra)
    .run();
  return NextResponse.json({ ok: true });
}
