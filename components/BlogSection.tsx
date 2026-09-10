import Image from "next/image";

export interface BlogPost {
  src: string;
  href: string;
  alt?: string;
}

interface Props {
  posts: BlogPost[];
  moreHref?: string;
}

export default function BlogSection({ posts, moreHref = "#" }: Props) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-5">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[13px] font-medium text-[#c90f45]">우주전자 엠케이전자 blog</p>
          <h2 className="mb-2 text-[34px] font-black tracking-[-0.05em] text-[#1a1a1a]">
            가전 케어 및 관리 방법과 <br />
            다양한 가전 정보를 확인해보세요
          </h2>
          <p className="text-[14px] text-[#888]">업데이트 내용을 확인해보세요</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {posts.map((post, i) => (
            <a href={post.href} key={i} className="overflow-hidden rounded-lg" target="_blank" rel="noopener noreferrer">
              <Image src={post.src} alt={post.alt ?? `블로그 ${i + 1}`} width={200} height={150} className="max-h-[300px] w-full object-cover transition-opacity hover:opacity-90" />
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href={moreHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1 rounded-full border border-[#ccc] px-8 text-[13px] text-[#555] hover:border-[#999]"
          >
            전체보기 <span className="text-[16px] font-light">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
