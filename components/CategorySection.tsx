import Link from "next/link";
import Image from "next/image";

const items = [
  {
    label: "냉장고",
    href: "/products/kitchen?category=냉장고",
    image: "https://www.lge.co.kr/medias/sys_master/images/h42/hbd/26232614576158/T875MHR111-Ecom-01.jpg",
    bg: "#f5ede8",
  },
  {
    label: "김치냉장고",
    href: "/products/kitchen?category=김치냉장고",
    image: "https://www.lge.co.kr/medias/sys_master/images/h91/h91/26124868574750/Z402MEE153-Ecom-01.jpg",
    bg: "#edf2f0",
  },
  {
    label: "식기세척기",
    href: "/products/kitchen?category=식기세척기",
    image: "https://www.lge.co.kr/medias/sys_master/images/h12/h2a/26124873588766/DFB22WQAP-Ecom-01.jpg",
    bg: "#eef2f8",
  },
  {
    label: "광파오븐",
    href: "/products/kitchen?category=광파오븐",
    image: "https://www.lge.co.kr/medias/sys_master/images/h8a/h38/26124873785374/MH7295QDS-Ecom-01.jpg",
    bg: "#f5f2e8",
  },
  {
    label: "스탠바이미",
    href: "/products/tv?category=스탠바이미",
    image: "https://www.lge.co.kr/medias/sys_master/images/h8a/h37/26124867428382/27LX6TEGA-Ecom-01.jpg",
    bg: "#edf0f5",
  },
  {
    label: "OLED TV",
    href: "/products/tv?category=OLED",
    image: "https://www.lge.co.kr/medias/sys_master/images/ha0/h9c/26124867297310/OLED65G4KNA-Ecom-01.jpg",
    bg: "#f0edf5",
  },
  {
    label: "세탁기",
    href: "/products/living?category=세탁기",
    image: "https://www.lge.co.kr/medias/sys_master/images/h6f/hb8/26124867952670/T21MX9B-Ecom-01.jpg",
    bg: "#edf5f5",
  },
  {
    label: "워시타워",
    href: "/products/living?category=워시타워",
    image: "https://www.lge.co.kr/medias/sys_master/images/h22/h57/26124867493918/W20WHN-Ecom-01.jpg",
    bg: "#f0f5ee",
  },
  {
    label: "스타일러",
    href: "/products/living?category=스타일러",
    image: "https://www.lge.co.kr/medias/sys_master/images/h44/h3b/26124867755038/SC5MBR42S-Ecom-01.jpg",
    bg: "#f5eef2",
  },
  {
    label: "청소기",
    href: "/products/living?category=청소기",
    image: "https://www.lge.co.kr/medias/sys_master/images/h7c/h12/26124867624990/A9K-ULTRA-Ecom-01.jpg",
    bg: "#f2f0eb",
  },
  {
    label: "에어컨",
    href: "/products/air?category=에어컨",
    image: "https://www.lge.co.kr/medias/sys_master/images/h0e/h9b/26124867952670/UN163S0WA-Ecom-01.jpg",
    bg: "#eaf2f8",
  },
  {
    label: "공기청정기",
    href: "/products/air?category=공기청정기",
    image: "https://www.lge.co.kr/medias/sys_master/images/h5c/h7d/26124867034142/AS201NWA-Ecom-01.jpg",
    bg: "#eef5ee",
  },
  {
    label: "안마의자",
    href: "/products/living?category=안마의자",
    image: "https://www.lge.co.kr/medias/sys_master/images/h8b/h2b/26124867362846/UM505HG-Ecom-01.jpg",
    bg: "#f5ede8",
  },
];

export default function CategorySection() {
  return (
    <section className="border-b border-[#f1f1f1] bg-white py-10">
      <div className="mx-auto max-w-300 px-5">
        <h2 className="mb-8 text-[20px] font-black tracking-[-0.04em] text-[#1a1a1a]">
          카테고리
        </h2>

        {/* 가로 스크롤 (모바일), 균등 분배 (데스크톱) */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:gap-6 lg:justify-between lg:overflow-visible">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              {/* 원형 이미지 */}
              <div
                className="relative h-22 w-22 overflow-hidden rounded-full transition-shadow duration-200 group-hover:shadow-md sm:h-25 sm:w-25"
                style={{ backgroundColor: item.bg }}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="100px"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              </div>

              {/* 라벨 */}
              <span className="text-[12px] font-medium tracking-[-0.02em] text-[#333] group-hover:text-[#c90f45] sm:text-[13px]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
