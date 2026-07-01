import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const { env } = await getCloudflareContext();
  const row = await env.lg_product_db.prepare("SELECT label FROM sections WHERE id=?").bind(section).first<{ label: string }>();
  const label = row?.label ?? section;
  return {
    title: `${label} 상품 상세`,
    description: `LG전자 베스트샵 용산점 ${label} 구독·렌탈 상품 상세 정보를 확인하세요.`,
  };
}

export default function SectionDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
