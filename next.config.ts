import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.pstatic.net" },
      { protocol: "https", hostname: "blogthumb.pstatic.net" },
      { protocol: "https", hostname: "**.lge.com" },
      { protocol: "https", hostname: "**.lge.co.kr" },
    ],
  },
};

export default nextConfig;
