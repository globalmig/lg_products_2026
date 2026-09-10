import NewsEventPageContent from "@/components/NewsEventPageContent";

export const metadata = {
  title: "리뷰 이벤트 | 우주상담센터",
  description: "가전 구독 구매 후기 이벤트 – 리뷰 작성하고 경품 받아가세요.",
  alternates: { canonical: "/news" },
};

export default function ReviewEventPage() {
  return <NewsEventPageContent />;
}
