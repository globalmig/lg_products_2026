import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const { results } = await env.lg_product_db
    .prepare("SELECT * FROM posts WHERE type=? ORDER BY created_at DESC")
    .bind(type)
    .all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { id, type, title, content = "", created_at } = await req.json();
  await env.lg_product_db
    .prepare("INSERT INTO posts (id, type, title, content, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, type, title, content, created_at)
    .run();
  return NextResponse.json({ ok: true });
}
