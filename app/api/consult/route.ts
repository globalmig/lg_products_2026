import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const { env } = getRequestContext<CloudflareEnv>();
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
  const { env } = getRequestContext<CloudflareEnv>();
  const {
    id, name, phone, submitted_at, status = "new",
    // legacy fields
    purpose = "", area = "", apartment = "", channels = [], model = "",
    // new subscription fields
    selectedProducts = [], careType = "", availableTime = "", extra = "",
  } = await req.json();
  await env.lg_product_db
    .prepare(
      "INSERT INTO consult_submissions (id, name, phone, purpose, area, apartment, channels, model, submitted_at, status, selected_products, care_type, available_time, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, name, phone, purpose, area, apartment, JSON.stringify(channels), model, submitted_at, status, JSON.stringify(selectedProducts), careType, availableTime, extra)
    .run();
  return NextResponse.json({ ok: true });
}
