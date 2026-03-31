type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
};

const collectText = (node: any, out: string[]) => {
  if (!node || typeof node !== "object") return;
  if (typeof node.text === "string" && node.text.trim()) {
    out.push(node.text);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectText(child, out);
  }
};

/**
 * Best-effort conversion from Payload Lexical JSON -> plain text.
 * This is intentionally simple; it only needs to support rendering snippets/excerpts.
 */
export const lexicalToPlainText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;

  const rootChildren = (value as any)?.root?.children;
  if (!Array.isArray(rootChildren)) return "";

  const paragraphs: string[] = [];
  for (const child of rootChildren) {
    const parts: string[] = [];
    collectText(child as LexicalNode, parts);
    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    if (text) paragraphs.push(text);
  }

  return paragraphs.join("\n\n").trim();
};

/**
 * Converts a Payload "blocks" field (array of blocks) into plain text by extracting
 * only `richText` blocks with a `content` field.
 */
export const blocksToPlainText = (blocks: unknown): string => {
  if (!Array.isArray(blocks)) return "";
  const out: string[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const blockType = (block as any).blockType;
    if (blockType !== "richText") continue;
    const text = lexicalToPlainText((block as any).content);
    if (text) out.push(text);
  }
  return out.join("\n\n").trim();
};

