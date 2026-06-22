import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "misc";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  await env.lg_product_images.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ key });
}
