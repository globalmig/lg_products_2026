import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/lgbs-7x4q2/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
