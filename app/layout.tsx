import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | LG전자 베스트샵 용산점",
    default: "LG전자 베스트샵 용산점 – 가전 구독·렌탈 전문",
  },
  description:
    "LG전자 베스트샵 용산점. 정수기·공기청정기·에어컨·세탁기·냉장고 등 가전을 월 구독료로 합리적으로 이용하세요. 방문 상담·구독 신청 가능.",
  openGraph: {
    siteName: "LG전자 베스트샵 용산점",
    locale: "ko_KR",
    type: "website",
  },
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
