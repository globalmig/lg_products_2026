"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminStore, imageUrl, type Review } from "@/lib/adminStore";

const DEFAULT_REVIEWS: Review[] = [
  { id: "r1", stars: 5, image_key: "", content: "\"상담부터 설치까지 꼼꼼하게 챙겨주셔서 정말 만족스러웠어요. 제품도 생각보다 훨씬 조용하고 공간 활용이 좋네요. 매니저님이 색상 조합까지 같이 고민해줘서 인테리어에도 딱 맞게 선택했습니다.\"", name: "김*현", product: "LG 디오스 오브제컬렉션 냉장고", date: "2026.05.18", sort_order: 0 },
  { id: "r2", stars: 5, image_key: "", content: "\"구독 서비스가 이렇게 편할 줄 몰랐어요. 설치도 빠르고 관리까지 해준다니 너무 좋아요. 용산점 매니저분이 실제 사용 팁도 알려주셔서 처음 사용하는 데 전혀 어렵지 않았습니다.\"", name: "박*은", product: "LG 워시타워 렌탈 가전 구독", date: "2026.05.12", sort_order: 1 },
  { id: "r3", stars: 5, image_key: "", content: "\"혼자 사는데 거실에 두기 딱 좋은 사이즈예요. 가격 대비 화질이 정말 좋고, 배터리로 어디서나 볼 수 있어서 활용도가 높아요. 매장에서 직접 비교하고 구매할 수 있어서 좋았습니다.\"", name: "이*준", product: "LG 스탠바이미 2 렌탈 가전 구독", date: "2026.04.29", sort_order: 2 },
];

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    adminStore.reviews.get().then((data) => {
      if (data.length > 0) setReviews(data);
    });
  }, []);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-360 px-5">
        <div className="mb-10">
          <p className="mb-2 text-[13px] font-semibold tracking-widest text-[#c90f45]">REVIEW</p>
          <h2 className="text-[32px] font-black tracking-tighter text-[#1a1a1a]">고객 생생 후기</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((review) => {
            const img = imageUrl(review.image_key);
            return (
              <div
                key={review.id}
                className="flex flex-col justify-between rounded-xl border border-[#e8e8e8] p-7"
              >
                <div>
                  {img && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={img}
                        alt="리뷰 이미지"
                        width={400}
                        height={240}
                        className="w-full object-cover"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  )}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <span key={i} className="text-[18px] text-[#f5a623]">★</span>
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed tracking-[-0.02em] text-[#333]">
                    {review.content}
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-[14px] font-bold text-[#1a1a1a]">{review.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#999]">{review.product}</p>
                  <p className="mt-1 text-[12px] text-[#bbb]">{review.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
