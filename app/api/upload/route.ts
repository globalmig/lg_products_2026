import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "misc";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const uuid = crypto.randomUUID();
  const filename = `${uuid}.${ext}`;
  const key = `${folder}/${filename}`;

  try {
    const { env } = await getCloudflareContext();
    await env.lg_product_images.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });
    return NextResponse.json({ key });
  } catch {
    // local dev fallback: save to public/uploads/
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    return NextResponse.json({ key: `/uploads/${key}` });
  }
}
