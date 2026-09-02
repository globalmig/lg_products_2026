"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import Image from "next/image";
import AdminLoading from "./AdminLoading";
import { adminStore, uploadImage, imageUrl, type Post } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";
import { renderPostContent } from "@/lib/renderPostContent";

interface Props {
  storeKey: "benefit" | "smallbiz";
  title: string;
}

type ContentMode = "upload" | "url" | "html";

function detectMode(value: string): ContentMode {
  const v = value.trim();
  if (v.startsWith("<")) return "html";
  if (/^https?:\/\/\S+$/.test(v) && !v.includes("\n")) return "url";
  return "html";
}

const CONTENT_TAGS = [
  { label: "img", before: '<img src="" alt="" style="max-width:100%;height:auto;display:block;" />', after: "" },
  { label: "p", before: "<p>", after: "</p>" },
  { label: "h2", before: "<h2>", after: "</h2>" },
  { label: "h3", before: "<h3>", after: "</h3>" },
  { label: "div", before: "<div>\n", after: "\n</div>" },
  { label: "strong", before: "<strong>", after: "</strong>" },
  { label: "a", before: '<a href="" target="_blank">', after: "</a>" },
  { label: "br", before: "<br />", after: "" },
  { label: "hr", before: '<hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />', after: "" },
] as const;

export interface ContentEditorHandle {
  resolve: () => Promise<string>;
}

const PostContentEditor = forwardRef<ContentEditorHandle, { initialValue: string }>(function PostContentEditor(
  { initialValue },
  ref
) {
  const initMode = detectMode(initialValue);
  const [mode, setMode] = useState<ContentMode>(initMode);
  const [preview, setPreview] = useState<string>(initMode === "upload" ? initialValue.trim() : "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>(initMode === "url" ? initialValue.trim() : "");
  const [html, setHtml] = useState<string>(initMode === "html" ? initialValue : "");
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFile = (file: File) => {
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleHtmlFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const sniff = new TextDecoder("latin1").decode(buffer.slice(0, 2000));
      const isEucKr = /charset=["']?euc-kr/i.test(sniff);
      const text = new TextDecoder(isEucKr ? "euc-kr" : "utf-8").decode(buffer);
      setHtml(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const insertTag = (before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = html.slice(start, end);
    const next = html.slice(0, start) + before + selected + after + html.slice(end);
    setHtml(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  };

  useImperativeHandle(ref, () => ({
    resolve: async () => {
      if (mode === "upload") {
        // uploadImage는 R2 오브젝트 key(예: "posts/xxx.jpg")만 반환하므로, 그대로 저장하면
        // renderPostContent/detectMode가 이미지 URL로 인식하지 못해 본문에 텍스트로만 노출된다.
        // 반드시 imageUrl()로 완전한 URL로 변환한 뒤 저장해야 한다.
        if (pendingFile) return imageUrl(await uploadImage(pendingFile, "posts"));
        return preview.trim();
      }
      if (mode === "url") return url.trim();
      return html.trim();
    },
  }));

  return (
    <div>
      <label className="mb-2 block text-[12px] font-semibold text-[#555]">
        내용 <span className="font-normal text-[#aaa]">(상세 페이지에 표시)</span>
      </label>
      <div className="mb-3 flex rounded-xl border border-[#e8e8e8] overflow-hidden">
        {(
          [
            { key: "upload", label: "파일 업로드" },
            { key: "url", label: "이미지 URL" },
            { key: "html", label: "HTML 작성" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${
              mode === key ? "bg-[#1a1a1a] text-white" : "bg-white text-[#888] hover:bg-[#f5f5f5]"
            }`}
          >
            {mode === key && "✓ "}{label}
          </button>
        ))}
      </div>

      {mode === "upload" && (
        <>
          <p className="mb-1.5 text-[11px] text-[#bbb]">권장: 1080 × 600px · 16:9 또는 가로형 · PNG/JPG · 2MB 이하</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8e8e8] py-4 hover:border-[#c90f45] hover:bg-[#fff8fa] transition-colors"
          >
            {preview ? (
              <div className="relative h-28 w-full max-w-xs">
                <Image src={preview} alt="미리보기" fill className="object-contain rounded-lg" unoptimized />
              </div>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            )}
            <p className="text-[12px] text-[#aaa]">{preview ? "클릭하여 변경" : "클릭하거나 드래그하여 첨부"}</p>
          </div>
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); setPendingFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="mt-1.5 text-[11px] text-[#bbb] hover:text-[#c90f45]"
            >
              이미지 삭제
            </button>
          )}
        </>
      )}

      {mode === "url" && (
        <>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]"
          />
          {url && (
            <div className="relative mt-2 h-28 w-full overflow-hidden rounded-xl border border-[#f0f0f0]">
              <Image src={url} alt="미리보기" fill className="object-contain" unoptimized />
            </div>
          )}
        </>
      )}

      {mode === "html" && (
        <>
          <p className="mb-1.5 text-[11px] text-[#bbb]">Iframe, 팝업링크 제외. 이미지 URL은 https로 작성해주세요. 마크다운 스타일(## 제목, - 목록 등)도 그대로 사용할 수 있습니다.</p>

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1 text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors">
              원본 .html 파일 불러오기 (인코딩 자동 감지)
              <input
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHtmlFileUpload(f); e.target.value = ""; }}
              />
            </label>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-1.5">
            {CONTENT_TAGS.map(({ label, before, after }) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); insertTag(before, after); }}
                className="rounded border border-[#e8e8e8] bg-white px-2 py-0.5 font-mono text-[11px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] transition-colors"
              >
                {`<${label}>`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="ml-auto shrink-0 rounded-full border border-[#e8e8e8] bg-white px-3 py-0.5 text-[11px] font-semibold text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]"
            >
              {showPreview ? "편집으로" : "미리보기"}
            </button>
          </div>

          {showPreview ? (
            <div className="prose-custom max-h-80 overflow-y-auto rounded-lg border border-[#e8e8e8] px-4 py-3">
              {html.trim() ? renderPostContent(html) : <p className="text-[13px] text-[#bbb]">내용을 입력하면 여기에 상세페이지처럼 표시됩니다.</p>}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={"<p>내용을 입력하세요</p>\n\n또는 마크다운 스타일:\n## 제목\n- 목록"}
              rows={8}
              className="w-full resize-y rounded-xl border border-[#e8e8e8] px-3 py-2.5 font-mono text-[12px] outline-none focus:border-[#c90f45]"
              spellCheck={false}
            />
          )}
          <p className="mt-1.5 text-[11px] text-[#bbb]">{html.length} 자</p>
        </>
      )}
    </div>
  );
});

export default function PostAdmin({ storeKey, title }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [adding, setAdding] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const editContentRef = useRef<ContentEditorHandle>(null);
  const addContentRef = useRef<ContentEditorHandle>(null);

  useEffect(() => {
    setLoading(true);
    adminStore.posts.get(storeKey).then((data) => { setPosts(data); setLoading(false); });
  }, [storeKey]);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const content = await editContentRef.current!.resolve();
    await adminStore.posts.update(editing.id, { title: editing.title, content });
    setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, title: editing.title, content } : p)));
    setEditing(null);
  };

  const handleAdd = async () => {
    if (!addTitle.trim()) return;
    const content = await addContentRef.current!.resolve();
    await adminStore.posts.add(storeKey, { title: addTitle, content });
    const updated = await adminStore.posts.get(storeKey);
    setPosts(updated);
    setAddTitle("");
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
                  <PostContentEditor key={post.id} ref={editContentRef} initialValue={post.content} />
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
          <div className="relative z-10 max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 mx-4">
            <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">게시글 추가</h3>
            <div className="space-y-3">
              <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)}
                placeholder="제목" className="h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[14px] font-semibold outline-none focus:border-[#c90f45]" />
              <PostContentEditor ref={addContentRef} initialValue="" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} disabled={!addTitle.trim()} className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white disabled:opacity-40">추가</button>
              <button onClick={() => setAdding(false)} className="flex h-10 flex-1 items-center justify-center rounded-full border border-[#e8e8e8] text-[14px] text-[#666]">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
