import HeroSlider from "@/components/HeroSlider";
import CategorySection from "@/components/CategorySection";
import EventBanner from "@/components/EventBanner";
import JuneEventProducts from "@/components/JuneEventProducts";
import Benefit from "@/components/Benefit";
import BlogSection from "@/components/BlogSection";
import ReviewSection from "@/components/ReviewSection";
import FeatureBannerSection from "@/components/FeatureBannerSection";
import HomeProductSections from "@/components/HomeProductSections";
import { getNaverBlogPosts } from "@/lib/naverBlog";

export default async function Home() {
  const blogPosts = await getNaverBlogPosts("lg_yongsan");

  return (
    <main className="min-h-[calc(100vh-44px)] bg-white text-black">
      {/* 1. 히어로 */}
      <HeroSlider />

      {/* 3. 카테고리 */}
      <CategorySection />

      {/* 3-1. 피처 배너 */}
      <FeatureBannerSection />

      {/* 4. 카테고리별 상품 슬라이더 */}
      <HomeProductSections />

      {/* 5. 6월 행사 배너 */}
      <EventBanner />

      {/* 6. 6월 행사 특가 제품 */}
      <JuneEventProducts />

      {/* 8. 혜택 소개 */}
      <Benefit bg="/images/main/bg_benefit.png" />

      {/* 8. 고객 생생 후기 */}
      <ReviewSection />
    </main>
  );
}
