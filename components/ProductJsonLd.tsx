import { SITE_URL, SITE_NAME } from "@/lib/siteConfig";
import type { ManagedProduct } from "@/lib/productStore";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export default function ProductJsonLd({ product, section }: { product: ManagedProduct; section: string }) {
  const url = absoluteUrl(`/products/${section}/${product.id}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.image ? { image: [absoluteUrl(product.image)] } : {}),
    description: `${product.name} 월 구독료 ${product.monthlyPrice.toLocaleString()}원부터`,
    sku: product.model,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "KRW",
      price: product.monthlyPrice,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
