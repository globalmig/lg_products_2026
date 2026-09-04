import type { ReactNode } from "react";

function renderMarkdownLite(content: string): ReactNode[] {
  const lines = content.trim().split("\n");
  const elements: ReactNode[] = [];
  let key = 0;
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const [head, , ...body] = tableRows;
    elements.push(
      <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-[#e8e8e8]">
        <table className="w-full text-[14px]">
          <thead className="bg-[#f8f8f8]">
            <tr>{head.filter(Boolean).map((cell, i) => <th key={i} className="px-5 py-3 text-left font-bold text-[#333]">{cell.trim()}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            {body.map((row, i) => <tr key={i}>{row.filter(Boolean).map((cell, j) => <td key={j} className="px-5 py-3 text-[#555]">{cell.trim()}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("|")) { inTable = true; tableRows.push(line.split("|").slice(1, -1)); continue; }
    if (inTable) flushTable();
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="mt-10 mb-4 text-[24px] font-black tracking-[-0.04em] text-[#1a1a1a]">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} className="mt-7 mb-3 text-[18px] font-bold tracking-[-0.03em] text-[#1a1a1a]">{line.slice(4)}</h3>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} className="mt-4 mb-1 font-bold text-[#1a1a1a]">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(<li key={key++} className="ml-5 list-disc py-0.5 text-[15px] leading-[1.8] text-[#444]" dangerouslySetInnerHTML={{ __html: text }} />);
    } else if (line.startsWith("> ")) {
      elements.push(<blockquote key={key++} className="my-4 border-l-4 border-[#c90f45] bg-[#fff5f7] px-5 py-3 text-[14px] text-[#666]">{line.slice(2)}</blockquote>);
    } else if (/^\d+\./.test(line)) {
      elements.push(<li key={key++} className="ml-5 list-decimal py-0.5 text-[15px] leading-[1.8] text-[#444]">{line.replace(/^\d+\.\s/, "")}</li>);
    } else if (line === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<p key={key++} className="text-[15px] leading-[1.8] text-[#444]">{line}</p>);
    }
  }
  if (inTable) flushTable();
  return elements;
}

// DB 스키마 변경 없이 subtitle을 저장하기 위해 content 맨 앞에 숨김 마커로 함께 저장한다.
const SUBTITLE_PREFIX = "<!--subtitle:";
const SUBTITLE_SUFFIX = "-->";

/** content에서 숨김 서브타이틀 마커를 분리해 { subtitle, body }로 반환한다. */
export function parsePostContent(content: string): { subtitle: string; body: string } {
  const raw = content ?? "";
  if (raw.startsWith(SUBTITLE_PREFIX)) {
    const end = raw.indexOf(SUBTITLE_SUFFIX);
    if (end !== -1) {
      const encoded = raw.slice(SUBTITLE_PREFIX.length, end);
      const body = raw.slice(end + SUBTITLE_SUFFIX.length).replace(/^\n/, "");
      try {
        return { subtitle: decodeURIComponent(encoded), body };
      } catch {
        return { subtitle: "", body };
      }
    }
  }
  return { subtitle: "", body: raw };
}

/** subtitle과 본문을 다시 하나의 content 문자열로 합친다. */
export function buildPostContent(subtitle: string, body: string): string {
  const trimmedSubtitle = subtitle.trim();
  if (!trimmedSubtitle) return body;
  return `${SUBTITLE_PREFIX}${encodeURIComponent(trimmedSubtitle)}${SUBTITLE_SUFFIX}\n${body}`;
}

/** 목록 카드용 짧은 미리보기 텍스트를 만든다. 서브타이틀이 있으면 그것을 우선 사용한다. */
export function postPreviewText(content: string, maxLength = 120): string {
  const { subtitle, body } = parsePostContent(content);
  if (subtitle) return subtitle.slice(0, maxLength);
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) {
    return trimmed
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }
  if (/^(https?:\/\/|\/)\S+$/.test(trimmed) && !trimmed.includes("\n")) return "";
  return trimmed.replace(/[#*>\-|]/g, "").trim().slice(0, maxLength);
}

/**
 * 게시글 본문 렌더러. 상품 상세설명 편집과 동일하게 세 가지 작성 방식을 지원한다:
 * HTML(<로 시작) → 그대로 삽입, 단일 이미지 URL → <img>, 그 외 → 마크다운 라이트 파서.
 */
export function renderPostContent(content: string): ReactNode {
  const { body } = parsePostContent(content);
  const trimmed = body.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("<")) {
    return <div className="detail-html-content" dangerouslySetInnerHTML={{ __html: body }} />;
  }
  if (/^(https?:\/\/|\/)\S+$/.test(trimmed) && !trimmed.includes("\n")) {
    return <img src={trimmed} alt="" style={{ maxWidth: "100%", height: "auto", display: "block" }} />;
  }
  return <>{renderMarkdownLite(body)}</>;
}
