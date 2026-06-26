"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { adminStore, uploadImage, imageUrl, type Manager } from "@/lib/adminStore";
import ConfirmDialog from "./ConfirmDialog";

const EMPTY: Omit<Manager, "id"> = { img_key: "", name: "", store: "용산전자상가점", tags: [], desc: "", href: "#" };

export default function ManagerAdmin() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Manager, "id">>(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    adminStore.managers.get().then(setManagers);
  }, []);

  const handleSaveEdit = async () => {
    if (!editing) return;
    await adminStore.managers.update(editing.id, editing);
    setManagers((prev) => prev.map((m) => (m.id === editing.id ? editing : m)));
    setEditing(null);
  };

  const handleAdd = async () => {
    const newManager: Manager = { id: Date.now().toString(), ...form };
    await adminStore.managers.add(newManager);
    setManagers((prev) => [...prev, newManager]);
    setForm(EMPTY);
    setAdding(false);
  };

  const handleDelete = (id: string) => setConfirmId(id);

  const doDelete = async () => {
    if (!confirmId) return;
    await adminStore.managers.delete(confirmId);
    setManagers((prev) => prev.filter((m) => m.id !== confirmId));
    setConfirmId(null);
  };

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmId(null)} />}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-black text-[#1a1a1a]">매니저 관리</h2>
        <button onClick={() => setAdding(true)} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">
          + 매니저 추가
        </button>
      </div>

      <div className="space-y-4">
        {managers.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white p-5 shadow-sm">
            {editing?.id === m.id ? (
              <div>
                <ManagerForm data={editing} onChange={(d) => setEditing({ id: m.id, ...d })} />
                <div className="mt-3 flex gap-2">
                  <button onClick={handleSaveEdit} className="flex h-9 items-center rounded-full bg-[#c90f45] px-5 text-[13px] font-bold text-white">저장</button>
                  <button onClick={() => setEditing(null)} className="flex h-9 items-center rounded-full border border-[#e8e8e8] px-5 text-[13px] text-[#666]">취소</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f0dde2]">
                    {m.img_key && <Image src={imageUrl(m.img_key)} alt={m.name} width={48} height={48} className="h-full w-full object-cover object-top" unoptimized />}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{m.name} <span className="text-[13px] font-normal text-[#888]">{m.store}</span></p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#fdf3f5] px-2 py-0.5 text-[11px] text-[#c90f45]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setEditing({ ...m })} className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45]">수정</button>
                  <button onClick={() => handleDelete(m.id)} className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-red-400 hover:text-red-500">삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdding(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 mx-4">
            <h3 className="mb-4 text-[16px] font-black text-[#1a1a1a]">매니저 추가</h3>
            <ManagerForm data={form} onChange={setForm} />
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} disabled={!form.name} className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#c90f45] text-[14px] font-bold text-white disabled:opacity-40">추가</button>
              <button onClick={() => setAdding(false)} className="flex h-10 flex-1 items-center justify-center rounded-full border border-[#e8e8e8] text-[14px] text-[#666]">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerForm({ data, onChange }: { data: Omit<Manager, "id">; onChange: (v: Omit<Manager, "id">) => void }) {
  const f = (k: keyof Omit<Manager, "id">, v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="이름"><input value={data.name} onChange={(e) => f("name", e.target.value)} className={inp} /></Field>
        <Field label="지점"><input value={data.store} onChange={(e) => f("store", e.target.value)} className={inp} /></Field>
      </div>
      <Field label="프로필 이미지">
        <ImgUpload value={data.img_key} onChange={(v) => onChange({ ...data, img_key: v })} />
      </Field>
      <Field label="태그">
        <TagInput tags={data.tags} onChange={(tags) => onChange({ ...data, tags })} />
      </Field>
      <Field label="소개 문구"><input value={data.desc} onChange={(e) => f("desc", e.target.value)} className={inp} /></Field>
      <Field label="예약 링크"><input value={data.href} onChange={(e) => f("href", e.target.value)} className={inp} /></Field>
    </div>
  );
}

function ImgUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadImage(file, "managers");
      onChange(key);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]">
        {value
          ? <img src={imageUrl(value)} alt="" className="h-full w-full object-cover object-top" />
          : <span className="flex h-full w-full items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
        }
      </div>
      <div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] text-[#555] hover:border-[#c90f45] hover:text-[#c90f45] disabled:opacity-50">
          {uploading ? "업로드 중..." : value ? "이미지 변경" : "이미지 업로드"}
        </button>
        <p className="mt-1 text-[11px] text-[#bbb]">권장: 300 × 300px · 1:1 비율 · JPG/PNG</p>
        {value && (
          <button type="button" onClick={() => onChange("")} className="mt-1 text-[11px] text-[#bbb] hover:text-red-400">삭제</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const value = raw.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(",") || val.endsWith(" ")) {
      add(val.slice(0, -1));
    } else {
      setInput(val);
    }
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-[#e8e8e8] px-3 py-2 focus-within:border-[#c90f45]">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#fdf3f5] px-2.5 py-0.5 text-[12px] text-[#c90f45]">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="leading-none text-[#c90f45]/50 hover:text-[#c90f45]">×</button>
        </span>
      ))}
      <input value={input} onChange={handleChange} onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "태그 입력 후 Enter·쉼표·스페이스" : ""}
        className="min-w-30 flex-1 text-[13px] outline-none" />
    </div>
  );
}

const inp = "h-10 w-full rounded-lg border border-[#e8e8e8] px-3 text-[13px] outline-none focus:border-[#c90f45]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-[12px] font-semibold text-[#666]">{label}</p>{children}</div>;
}
