import Link from "next/link";

function safeHref(value) {
  if (typeof value !== "string" || /[\u0000-\u001f\s]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function inline(text, keyPrefix) {
  const parts = [];
  const matcher = /\[([^\]]{1,300})\]\(([^)]+)\)/g;
  let cursor = 0;
  let match;
  while ((match = matcher.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const href = safeHref(match[2]);
    parts.push(href ? (
      href.startsWith("/") ? <Link key={`${keyPrefix}-${match.index}`} href={href} className="font-medium text-primary-700 underline underline-offset-2 hover:text-primary-500">{match[1]}</Link> :
        <a key={`${keyPrefix}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 underline underline-offset-2 hover:text-primary-500">{match[1]}</a>
    ) : match[1]);
    cursor = matcher.lastIndex;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export default function SafeMarkdown({ content }) {
  const lines = String(content || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let code = [];
  let inCode = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", value: paragraph.join(" ").trim() });
    paragraph = [];
  }

  function flushCode() {
    if (!code.length) return;
    blocks.push({ type: "code", value: code.join("\n") });
    code = [];
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) flushCode(); else flushParagraph();
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const list = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ type: `h${heading[1].length}`, value: heading[2] });
    } else if (list) {
      flushParagraph();
      blocks.push({ type: "list", value: list[1] });
    } else if (!line.trim()) {
      flushParagraph();
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  if (inCode) flushCode();

  return (
    <div className="space-y-5 text-[1.05rem] leading-8 text-neutral-700">
      {blocks.map((block, index) => {
        // The article title is the page's only H1. Markdown starts at H2 so an
        // editor cannot accidentally create a second top-level heading.
        if (block.type === "h1") return <h2 key={index} className="font-display text-3xl font-bold text-primary-900">{inline(block.value, index)}</h2>;
        if (block.type === "h2") return <h2 key={index} className="font-display text-2xl font-bold text-primary-900">{inline(block.value, index)}</h2>;
        if (block.type === "h3") return <h3 key={index} className="font-display text-xl font-bold text-primary-900">{inline(block.value, index)}</h3>;
        if (block.type === "list") return <ul key={index} className="ml-5 list-disc space-y-1"><li>{inline(block.value, index)}</li></ul>;
        if (block.type === "code") return <pre key={index} className="overflow-x-auto rounded-xl bg-primary-950 p-4 text-sm leading-6 text-primary-50"><code>{block.value}</code></pre>;
        return <p key={index}>{inline(block.value, index)}</p>;
      })}
    </div>
  );
}
