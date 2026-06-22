import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { key } = await params;
  const objectKey = key.join("/");

  const object = await env.lg_product_images.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
