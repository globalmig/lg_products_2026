import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ConditionalLayout from "@/components/ConditionalLayout";

const SITE_URL = "https://lgproducts2026.cksdlr4579.workers.dev";
const SITE_NAME = "LG전자 베스트샵 용산점";
const SITE_DESCRIPTION =
  "LG전자 베스트샵 용산점. 정수기·공기청정기·에어컨·세탁기·냉장고 등 가전을 월 구독료로 합리적으로 이용하세요. 방문 상담·구독 신청 가능.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | LG전자 베스트샵 용산점",
    default: "LG전자 베스트샵 용산점 – 가전 구독·렌탈 전문",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "LG전자 베스트샵",
    "가전 구독",
    "가전 렌탈",
    "정수기 렌탈",
    "공기청정기 렌탈",
    "에어컨 렌탈",
    "세탁기 렌탈",
    "냉장고 렌탈",
    "LG 렌탈 구독",
  ],
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
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
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
