import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ConditionalLayout from "@/components/ConditionalLayout";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | LG전자 베스트샵 용산점",
    default: "LG전자 베스트샵 용산점 – 가전 구독·렌탈 전문",
  },
  description: SITE_DESCRIPTION,
  keywords: ["LG전자 베스트샵", "가전 구독", "가전 렌탈", "정수기 렌탈", "공기청정기 렌탈", "에어컨 렌탈", "세탁기 렌탈", "냉장고 렌탈", "LG 렌탈 구독"],
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "LG전자 베스트샵 용산점 – 가전 구독·렌탈 전문",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/main/hero.jpg", width: 1600, height: 699, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LG전자 베스트샵 용산점 – 가전 구독·렌탈 전문",
    description: SITE_DESCRIPTION,
    images: ["/images/main/hero.jpg"],
  },
  verification: {
    other: {
      "naver-site-verification": "a5d6ba1dccc63f0b2230efdaf75e27a0bb35008f",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c90f45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <ConditionalLayout />
        <Footer />
      </body>
    </html>
  );
}
