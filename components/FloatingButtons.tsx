import Image from "next/image";

const buttons = [
  { src: "/images/main/btn/reservation-1.png", alt: "상담 신청", primary: true, href: "/consult" },
  { src: "/images/main/btn/kakaotalk.png", alt: "카카오톡 상담", primary: false, href: "https://pf.kakao.com/_xnMRRX" },
  { src: "/images/main/btn/insta.png", alt: "인스타그램", primary: false, href: "https://www.instagram.com/lgebestshop_yongsan" },
  { src: "/images/main/btn/blog.png", alt: "블로그", primary: false, href: "https://blog.naver.com/lg_yongsan" },
];

export default function FloatingButtons() {
  return (
    <div className="fixed right-3 md:right-[2.5%] bottom-5 md:bottom-[10%] z-50 flex flex-col items-center gap-2 md:gap-3">
      {buttons.map((btn) => (
        <a href={btn.href} key={btn.alt} aria-label={btn.alt} target={btn.href.startsWith("http") ? "_blank" : undefined} rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}>
          <Image
            src={btn.src}
            alt={btn.alt}
            width={64}
            height={64}
            className={`drop-shadow-sm ${btn.primary ? "w-12 h-12 md:w-16 md:h-16" : "w-10 h-10 md:w-14 md:h-14"}`}
          />
        </a>
      ))}
    </div>
  );
}
