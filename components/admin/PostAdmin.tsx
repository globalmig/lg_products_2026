"use client";

import { useEffect, useRef, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import AdminLoading from "./AdminLoading";
import { adminStore, type Post } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";
import { renderPostContent } from "@/lib/renderPostContent";

interface Props {
  storeKey: "benefit" | "smallbiz";
  title: string;
}

const CONTENT_TAGS = [
  { label: "제목", before: "## ", after: "" },
  { label: "소제목", before: "### ", after: "" },
  { label: "굵게", before: "**", after: "**" },
  { label: "목록", before: "- ", after: "" },
  { label: "번호목록", before: "1. ", after: "" },
  { label: "인용", before: "> ", after: "" },
  { label: "표", before: "| 항목 | 내용 |\n| --- | --- |\n| ", after: " | 값 |" },
] as const;

function ContentEditor({
  value,
  onChange,
  textareaRef,
}: {
  value: string;
  onChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [preview, setPreview] = useState(false);

  const insertTag = (before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-1.5">
          {CONTENT_TAGS.map(({ label, before, after }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertTag(before, after); }}
              className="rounded border border-[#e8e8e8] bg-white px-2 py-0.5 text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-2 shrink-0 rounded-full border border-[#e8e8e8] px-3 py-1 text-[11px] font-semibold text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]"
        >
          {preview ? "편집으로" : "상세페이지 미리보기"}
        </button>
      </div>

      {preview ? (
        <div className="prose-custom max-h-80 overflow-y-auto rounded-lg border border-[#e8e8e8] px-4 py-3">
          {value.trim() ? renderPostContent(value) : <p className="text-[13px] text-[#bbb]">내용을 입력하면 여기에 상세페이지처럼 표시됩니다.</p>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"## 제목\n### 소제목\n**강조 문단**\n- 목록\n1. 번호목록\n> 인용문"}
          rows={8}
          className="w-full resize-y rounded-lg border border-[#e8e8e8] px-3 py-2 font-mono text-[13px] outline-none focus:border-[#c90f45]"
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default function PostAdmin({ storeKey, title }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const addTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    adminStore.posts.get(storeKey).then((data) => { setPosts(data); setLoading(false); });
  }, [storeKey]);

  const handleSaveEdit = async () => {
    if (!editing) return;
    await adminStore.posts.update(editing.id, { title: editing.title, content: editing.content });
    setPosts((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
  };

  const handleAdd = async () => {
    await adminStore.posts.add(storeKey, form);
    const updated = await adminStore.posts.get(storeKey);
    setPosts(updated);
    setForm({ title: "", content: "" });
    setAdding(false);
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.posts.delete(confirmId);
    setPosts((prev) => prev.filter((p) => p.id !== confirmId));
    setConfirmId(null);
  };

  if (loading) return <AdminLoading />;

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-black text-[#1a1a1a]">{title} 관리</h2>
        <button onClick={() => setAdding(true)} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">
          + 게시글 추가
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white py-20 text-center text-[14px] text-[#aaa] shadow-sm">등록된 게시글이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white p-5 shadow-sm">
              {editing?.id === post.id ? (
                <div className="space-y-3">
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="제목" className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[14px] font-semibold outline-none focus:border-[#c90f45]" />
                  <ContentEditor
                    value={editing.content}
                    onChange={(v) => setEditing({ ...editing, content: v })}
                    textareaRef={editTextareaRef}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">저장</button>
                    <button onClick={() => setEditing(null)} className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]">취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-[#1a1a1a]">{post.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#888]">{post.content}</p>
                    <p className="mt-1 text-[11px] text-[#bbb]">{new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setEditing({ ...post })} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]" title="수정"><LuPencil size={14} /></button>
                    <button onClick={() => handleDelete(post.id)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] hover:border-red-400 hover:text-red-500" title="삭제"><LuTrash2 size={14} /></button>
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
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 mx-4">
            <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">게시글 추가</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목" className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[14px] font-semibold outline-none focus:border-[#c90f45]" />
              <ContentEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
                textareaRef={addTextareaRef}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} disabled={!form.title} className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white disabled:opacity-40">추가</button>
              <button onClick={() => setAdding(false)} className="flex h-10 flex-1 items-center justify-center rounded-full border border-[#e8e8e8] text-[14px] text-[#666]">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
