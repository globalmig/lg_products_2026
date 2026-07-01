import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import GenericProductList from "@/components/GenericProductList";

async function getSectionLabel(section: string) {
  const { env } = await getCloudflareContext();
  const row = await env.lg_product_db.prepare("SELECT label FROM sections WHERE id=?").bind(section).first<{ label: string }>();
  return row?.label ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const label = await getSectionLabel(section);
  return { title: label ?? section };
}

export default async function SectionProductsPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const label = await getSectionLabel(section);
  if (!label) notFound();

  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      <div className="border-b border-[#f1f1f1] bg-white px-5 py-8">
        <div className="mx-auto max-w-270">
          <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#1a1a1a]">{label}</h1>
        </div>
      </div>

      <Suspense>
        <GenericProductList section={section} />
      </Suspense>
    </main>
  );
}
