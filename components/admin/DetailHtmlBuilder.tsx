"use client";

import { useState } from "react";
import Image from "next/image";

type BlockType = "image" | "text" | "heading" | "spacer" | "html";

interface Block {
  id: string;
  type: BlockType;
  src?: string;
  alt?: string;
  content?: string;
  height?: number;
  align?: "left" | "center" | "right";
  fontSize?: number;
  color?: string;
  bold?: boolean;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function blockToHtml(block: Block): string {
  switch (block.type) {
    case "image":
      return `<img src="${block.src ?? ""}" alt="${block.alt ?? ""}" style="max-width:100%;height:auto;display:block;" />`;
    case "text": {
      const parts = [
        `text-align:${block.align ?? "left"}`,
        `font-size:${block.fontSize ?? 14}px`,
        `color:${block.color ?? "#333333"}`,
        `margin:0`,
        block.bold ? "font-weight:bold" : "",
      ].filter(Boolean).join(";");
      return `<p style="${parts}">${block.content ?? ""}</p>`;
    }
    case "heading": {
      const parts = [
        `text-align:${block.align ?? "left"}`,
        `font-size:${block.fontSize ?? 22}px`,
        `color:${block.color ?? "#1a1a1a"}`,
        `font-weight:bold`,
        `margin:0`,
      ].join(";");
      return `<h2 style="${parts}">${block.content ?? ""}</h2>`;
    }
    case "spacer":
      return `<div style="height:${block.height ?? 24}px"></div>`;
    case "html":
      return block.content ?? "";
    default:
      return "";
  }
}

export function blocksToHtml(blocks: Block[]): string {
  return blocks.map(blockToHtml).join("\n");
}

function newBlock(type: BlockType): Block {
  const id = makeId();
  switch (type) {
    case "image":   return { id, type, src: "", alt: "" };
    case "text":    return { id, type, content: "", align: "left", fontSize: 14, color: "#333333", bold: false };
    case "heading": return { id, type, content: "", align: "left", fontSize: 22, color: "#1a1a1a" };
    case "spacer":  return { id, type, height: 24 };
    case "html":    return { id, type, content: "" };
  }
}

const PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: "image",   label: "이미지",  icon: "🖼" },
  { type: "text",    label: "텍스트",  icon: "T" },
  { type: "heading", label: "제목",    icon: "H" },
  { type: "spacer",  label: "여백",    icon: "↕" },
  { type: "html",    label: "HTML",    icon: "</>" },
];

function BlockCard({
  block,
  isDragging,
  isDropTarget,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  block: Block;
  isDragging: boolean;
  isDropTarget: boolean;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const set = <K extends keyof Block>(k: K, v: Block[K]) => onChange({ ...block, [k]: v });

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        "rounded-xl border bg-white transition-all",
        isDragging ? "opacity-40 scale-[0.98] border-[#c90f45]" : "border-[#e8e8e8]",
        isDropTarget && !isDragging ? "ring-2 ring-[#c90f45] ring-offset-1" : "",
      ].join(" ")}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2">
        <span className="cursor-grab select-none text-[16px] text-[#ccc] hover:text-[#888]" title="드래그하여 순서 변경">⠿</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaa]">
          {PALETTE.find((p) => p.type === block.type)?.icon}{" "}
          {PALETTE.find((p) => p.type === block.type)?.label}
        </span>
        <button type="button" onClick={onDelete} className="ml-auto text-[#ccc] hover:text-[#c90f45]">✕</button>
      </div>

      {/* 내용 */}
      <div className="p-3 space-y-2">
        {block.type === "image" && (
          <>
            <input
              type="url"
              value={block.src ?? ""}
              onChange={(e) => set("src", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-9 w-full rounded-lg border border-[#e8e8e8] px-3 text-[12px] outline-none focus:border-[#c90f45]"
            />
            <input
              type="text"
              value={block.alt ?? ""}
              onChange={(e) => set("alt", e.target.value)}
              placeholder="이미지 설명 (alt)"
              className="h-8 w-full rounded-lg border border-[#e8e8e8] px-3 text-[12px] outline-none focus:border-[#c90f45]"
            />
            {block.src && (
              <div className="relative h-24 w-full overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#fafafa]">
                <Image src={block.src} alt={block.alt ?? ""} fill className="object-contain" unoptimized />
              </div>
            )}
          </>
        )}

        {(block.type === "text" || block.type === "heading") && (
          <>
            <textarea
              value={block.content ?? ""}
              onChange={(e) => set("content", e.target.value)}
              placeholder={block.type === "heading" ? "제목 입력..." : "텍스트 입력..."}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#e8e8e8] px-3 py-2 text-[12px] outline-none focus:border-[#c90f45]"
            />
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={block.align ?? "left"}
                onChange={(e) => set("align", e.target.value as "left" | "center" | "right")}
                className="h-8 rounded-lg border border-[#e8e8e8] px-2 text-[11px] outline-none"
              >
                <option value="left">좌측</option>
                <option value="center">중앙</option>
                <option value="right">우측</option>
              </select>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#aaa]">크기</span>
                <input
                  type="number"
                  value={block.fontSize ?? (block.type === "heading" ? 22 : 14)}
                  onChange={(e) => set("fontSize", Number(e.target.value))}
                  min={8} max={72}
                  className="h-8 w-14 rounded-lg border border-[#e8e8e8] px-2 text-[11px] outline-none"
                />
                <span className="text-[11px] text-[#aaa]">px</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#aaa]">색상</span>
                <input
                  type="color"
                  value={block.color ?? "#333333"}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-lg border border-[#e8e8e8] outline-none"
                />
              </div>
              {block.type === "text" && (
                <label className="flex cursor-pointer items-center gap-1 text-[11px] text-[#555]">
                  <input
                    type="checkbox"
                    checked={block.bold ?? false}
                    onChange={(e) => set("bold", e.target.checked)}
                    className="accent-[#c90f45]"
                  />
                  굵게
                </label>
              )}
            </div>
          </>
        )}

        {block.type === "spacer" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#888]">높이</span>
            <input
              type="range"
              min={4} max={200}
              value={block.height ?? 24}
              onChange={(e) => set("height", Number(e.target.value))}
              className="flex-1 accent-[#c90f45]"
            />
            <span className="w-10 text-right text-[11px] text-[#555]">{block.height ?? 24}px</span>
          </div>
        )}

        {block.type === "html" && (
          <textarea
            value={block.content ?? ""}
            onChange={(e) => set("content", e.target.value)}
            placeholder={"<img src='https://...' />\n<div>...</div>"}
            rows={4}
            className="w-full resize-y rounded-lg border border-[#e8e8e8] px-3 py-2 font-mono text-[11px] outline-none focus:border-[#c90f45]"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

export default function DetailHtmlBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    value.trim() ? [{ id: makeId(), type: "html", content: value }] : []
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const commit = (next: Block[]) => {
    setBlocks(next);
    onChange(blocksToHtml(next));
  };

  const addBlock = (type: BlockType) => commit([...blocks, newBlock(type)]);
  const updateBlock = (idx: number, b: Block) => commit(blocks.map((old, i) => (i === idx ? b : old)));
  const deleteBlock = (idx: number) => commit(blocks.filter((_, i) => i !== idx));

  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const next = [...blocks];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    commit(next);
    setDragIdx(null);
    setDropIdx(null);
  };

  return (
    <div className="space-y-3">
      {/* 팔레트 */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-2">
        <span className="self-center text-[11px] font-semibold text-[#aaa]">+ 추가:</span>
        {PALETTE.map(({ type, label, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="flex items-center gap-1 rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1 text-[12px] font-medium text-[#555] transition-colors hover:border-[#c90f45] hover:text-[#c90f45]"
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* 블록 목록 */}
      {blocks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#e8e8e8] py-10 text-center text-[12px] text-[#ccc]">
          위에서 요소를 추가하면 여기에 표시됩니다
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <BlockCard
              key={block.id}
              block={block}
              isDragging={dragIdx === idx}
              isDropTarget={dropIdx === idx}
              onChange={(b) => updateBlock(idx, b)}
              onDelete={() => deleteBlock(idx)}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => { e.preventDefault(); setDropIdx(idx); }}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setDropIdx(null); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
