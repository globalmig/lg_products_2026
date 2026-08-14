export function dedupeMapNames(html: string): string {
  let pairIndex = 0;
  return html.replace(
    /(usemap=["']#)[^"']+(["'])|<map(\s+name=["'])[^"']+(["'])/gi,
    (match, umPrefix, umSuffix, mapPrefix, mapSuffix) => {
      if (umPrefix) return `${umPrefix}usp_map_${pairIndex + 1}${umSuffix}`;
      pairIndex += 1;
      return `<map${mapPrefix}usp_map_${pairIndex}${mapSuffix}`;
    }
  );
}

export function withLazyImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) =>
    /\sloading=/i.test(tag) ? tag : tag.replace(/<img\b/i, '<img loading="lazy" decoding="async"')
  );
}

// 전체 HTML 문서(<html><head><body>...)로 등록된 상세설명은 iframe 없이 body 안쪽
// 내용만 페이지 DOM에 직접 삽입한다. head(및 그 안의 <style>)는 버린다 — 그대로 두면
// <style> 태그가 스코프 없이 사이트 전체에 영향을 줄 수 있기 때문이다. 반응형 처리는
// globals.css의 .detail-html-content 규칙이 담당한다.
export function extractBodyContent(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
}
