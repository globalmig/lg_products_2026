import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "misc";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const uuid = crypto.randomUUID();
  const filename = `${uuid}.${ext}`;
  const key = `${folder}/${filename}`;

  const MIME: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", avif: "image/avif",
  };
  const contentType = file.type || MIME[ext] || "image/jpeg";

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Try R2
  try {
    const { env } = await getCloudflareContext();
    await env.lg_product_images.put(key, bytes, {
      httpMetadata: { contentType },
    });
    const head = await env.lg_product_images.head(key);
    if (!head) {
      return NextResponse.json({ error: "R2 put reported success but file not found" }, { status: 500 });
    }
    return NextResponse.json({ key, size: bytes.byteLength, r2Size: head.size });
  } catch (r2Err) {
    // In production Workers, filesystem is unavailable — surface the error
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: String(r2Err) }, { status: 500 });
    }
  }

  // Local dev fallback
  try {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(bytes));
    return NextResponse.json({ key: `/uploads/${key}` });
  } catch (fsErr) {
    return NextResponse.json({ error: String(fsErr) }, { status: 500 });
  }
}
