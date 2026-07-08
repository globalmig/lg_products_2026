import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");

  let env: Awaited<ReturnType<typeof getCloudflareContext>>["env"];
  try {
    ({ env } = await getCloudflareContext());
  } catch {
    return new Response("R2 not available in local dev (use wrangler dev)", { status: 503 });
  }

  const object = await env.lg_product_images.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  // object.writeHttpMetadata(headers)는 인자로 받은 Headers를 참조로 직접 변형하는 방식이라
  // `next dev`(plain, wrangler 아님)에서 R2 바인딩이 RPC로 프록시될 때 그 변형이 전달되지 않고
  // 직렬화 에러(DevalueError)로 깨진다. httpMetadata의 필드를 직접 읽어 설정하면 안전하다.
  const meta = object.httpMetadata;
  if (meta?.contentType) headers.set("Content-Type", meta.contentType);
  if (meta?.contentDisposition) headers.set("Content-Disposition", meta.contentDisposition);
  if (meta?.contentEncoding) headers.set("Content-Encoding", meta.contentEncoding);
  if (meta?.contentLanguage) headers.set("Content-Language", meta.contentLanguage);
  if (meta?.cacheControl) headers.set("Cache-Control", meta.cacheControl);
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
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
