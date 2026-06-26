"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { adminStore, uploadImage, imageUrl, type EventPost } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

const EMPTY: Omit<EventPost, "id" | "sort_order" | "created_at"> = {
  title: "",
  subtitle: "",
  image_key: "",
  link: "",
};

export default function EventPostAdmin() {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [editing, setEditing] = useState<EventPost | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    adminStore.eventPosts.get().then(setPosts);
  }, []);

  const handleSaveEdit = async () => {
    if (!editing) return;
    await adminStore.eventPosts.update(editing.id, editing);
    setPosts((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
  };

  const handleAdd = async () => {
    const newPost: EventPost = {
      id: `ep_${Date.now()}`,
      ...form,
      sort_order: posts.length,
      created_at: new Date().toISOString().slice(0, 10),
    };
    await adminStore.eventPosts.add(newPost);
    setPosts((prev) => [...prev, newPost]);
    setForm(EMPTY);
    setAdding(false);
  };

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.eventPosts.delete(confirmId);
    setPosts((prev) => prev.filter((p) => p.id !== confirmId));
    setConfirmId(null);
  };

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#1a1a1a]">이달의 행사 게시글 관리</h2>
          <p className="mt-0.5 text-[12px] text-[#aaa]">메인화면 &quot;이달의 행사&quot; 섹션에 표시할 게시글을 등록합니다</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white"
        >
          + 게시글 추가
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#f0f0f0] py-12 text-center text-[14px] text-[#bbb]">
          등록된 게시글이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white p-5 shadow-sm">
              {editing?.id === post.id ? (
                <PostForm
                  data={editing}
                  onChange={setEditing as (v: EventPost) => void}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {post.image_key ? (
                      <Image
                        src={imageUrl(post.image_key)}
                        alt=""
                        width={100}
                        height={60}
                        className="h-16 w-24 shrink-0 rounded-lg object-cover bg-[#f5f5f5]"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] text-[11px] text-[#bbb]">
                        이미지 없음
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#1a1a1a]">{post.title || "(제목 없음)"}</p>
                      {post.subtitle && <p className="mt-0.5 truncate text-[12px] text-[#777]">{post.subtitle}</p>}
                      {post.link && (
                        <p className="mt-1 truncate text-[11px] text-[#aaa]">🔗 {post.link}</p>
                      )}
                      <p className="mt-1 text-[11px] text-[#ccc]">{post.created_at}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditing({ ...post })}
                      className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setConfirmId(post.id)}
                      className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-red-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdding(false)} />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">게시글 추가</h3>
            <PostForm
              data={{ id: "", ...form, sort_order: 0, created_at: "" }}
              onChange={(v) => setForm({ title: v.title, subtitle: v.subtitle, image_key: v.image_key, link: v.link })}
              onSave={handleAdd}
              onCancel={() => setAdding(false)}
              saveLabel="추가"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PostForm({
  data,
  onChange,
  onSave,
  onCancel,
  saveLabel = "저장",
}: {
  data: EventPost;
  onChange: (v: EventPost) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "event-posts");
      onChange({ ...data, image_key: key });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const img = imageUrl(data.image_key);

  return (
    <div className="space-y-3">
      {/* 이미지 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">배너 이미지 (선택)</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] transition-colors"
        >
          {uploading ? (
            <p className="text-[13px] text-[#aaa]">업로드 중...</p>
          ) : img ? (
            <Image src={img} alt="" width={300} height={120} className="max-h-32 w-full rounded-lg object-cover" unoptimized />
          ) : (
            <p className="text-[12px] text-[#aaa]">클릭해서 이미지 업로드</p>
          )}
          {img && !uploading && <p className="text-[11px] text-[#aaa]">클릭해서 이미지 변경</p>}
          {!img && !uploading && <p className="text-[11px] text-[#bbb]">권장: 800 × 400px · 가로형 · JPG/PNG · 2MB 이하</p>}
        </div>
        {img && (
          <button type="button" onClick={() => onChange({ ...data, image_key: "" })} className="mt-1 text-[11px] text-[#bbb] hover:text-red-400">
            이미지 삭제
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* 제목 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">제목</p>
        <input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="예: 6월 특별 할인 이벤트"
          className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
        />
      </div>

      {/* 부제목 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">부제목 <span className="font-normal text-[#aaa]">(선택)</span></p>
        <input
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="예: 구독 가전 최대 30% 혜택"
          className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
        />
      </div>

      {/* 링크 */}
      <div>
        <p className="mb-1 text-[12px] font-semibold text-[#666]">링크 URL <span className="font-normal text-[#aaa]">(선택)</span></p>
        <input
          value={data.link}
          onChange={(e) => onChange({ ...data, link: e.target.value })}
          placeholder="예: /benefit 또는 https://..."
          className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={uploading || !data.title}
          className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white disabled:opacity-40"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]"
        >
          취소
        </button>
      </div>
    </div>
  );
}
