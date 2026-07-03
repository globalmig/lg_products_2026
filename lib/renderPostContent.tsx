import type { ReactNode } from "react";

export function renderPostContent(content: string): ReactNode[] {
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
