import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { env } = await getCloudflareContext();
  const { key } = await params;
  const objectKey = key.join("/");

  const object = await env.lg_product_images.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  // Ensure Content-Type is set (next/image requires it)
  if (!headers.get("Content-Type")) {
    const ext = objectKey.split(".").pop()?.toLowerCase() ?? "";
    const MIME: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      gif: "image/gif", webp: "image/webp", avif: "image/avif",
    };
    headers.set("Content-Type", MIME[ext] ?? "image/jpeg");
  }

  return new Response(object.body, { headers });
}
