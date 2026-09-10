import type { Metadata } from "next";
import type { ManagedProduct } from "./productStore";
import { SITE_URL, SITE_NAME } from "./siteConfig";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export function buildProductMetadata(product: ManagedProduct, section: string): Metadata {
  const price = product.monthlyPrice.toLocaleString();
  const title = `${product.name} 월 ${price}원 렌탈·구독`;
  const description = `${product.name}(${product.model})을 월 ${price}원부터 구독하세요. 설치·정기관리·AS까지 한번에 제공합니다.`;
  const url = `/products/${section}/${product.id}`;
  const images = product.image ? [{ url: absoluteUrl(product.image), alt: product.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url: absoluteUrl(url),
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export function notFoundMetadata(): Metadata {
  return { title: "상품을 찾을 수 없습니다" };
}
