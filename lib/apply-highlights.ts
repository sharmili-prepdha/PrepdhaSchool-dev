import type { JSONContent } from "@tiptap/react";
import type { UserHighlight } from "@/types/rich-text.types";

/**
 * Merges user highlights into base Tiptap JSON content.
 * Base content is shared; highlights are stored per user and applied at render time.
 *
 * Uses ProseMirror positions: from_pos and to_pos are character offsets from doc start.
 * Ranges are [from_pos, to_pos) (start inclusive, end exclusive).
 */
export function applyHighlightsToJson(
  content: JSONContent,
  highlights: UserHighlight[],
): JSONContent {
  if (!highlights.length) return content;

  const sorted = [...highlights].sort((a, b) => a.fromPos - b.fromPos);
  let pos = 0;

  function processNode(node: JSONContent): {
    nodes: JSONContent[];
    size: number;
  } {
    if (!node) return { nodes: [], size: 0 };

    if (node.type === "text" && typeof node.text === "string") {
      const from = pos;
      const to = pos + node.text.length;
      pos = to;

      // ProseMirror positions are 1 less than our traversal (we count block open tokens).
      // Subtract 1 so highlights (from editor selection) match.
      const segments = getHighlightSegments(from - 1, to - 1, sorted);
      if (segments.length === 1 && !segments[0].highlighted) {
        return { nodes: [{ ...node }], size: node.text.length };
      }

      const newNodes: JSONContent[] = [];
      let idx = 0;
      for (const seg of segments) {
        const text = node.text.slice(idx, idx + seg.len);
        if (seg.highlighted && seg.color) {
          newNodes.push({
            type: "text",
            text,
            marks: [{ type: "highlight", attrs: { color: seg.color } }],
          });
        } else if (seg.highlighted) {
          newNodes.push({
            type: "text",
            text,
            marks: [{ type: "highlight" }],
          });
        } else {
          newNodes.push({ type: "text", text });
        }
        idx += seg.len;
      }

      return { nodes: newNodes, size: node.text.length };
    }

    if (node.content && Array.isArray(node.content)) {
      const startPos = pos;
      pos += 1;
      const newContent: JSONContent[] = [];
      for (const child of node.content) {
        const { nodes: childNodes } = processNode(child as JSONContent);
        newContent.push(...childNodes);
      }
      // Doc node has no closing token (size = 1 + children); other nodes add 1 for close
      if (node.type !== "doc") {
        pos += 1;
      }

      return {
        nodes: [{ ...node, content: newContent }],
        size: pos - startPos,
      };
    }

    const startPos = pos;
    pos += 1;
    if (node.content && Array.isArray(node.content)) {
      const newContent: JSONContent[] = [];
      for (const child of node.content as JSONContent[]) {
        const { nodes: childNodes } = processNode(child as JSONContent);
        newContent.push(...childNodes);
      }
      pos += 1;
      return {
        nodes: [{ ...node, content: newContent }],
        size: pos - startPos,
      };
    }
    pos += 1;
    return { nodes: [{ ...node }], size: 2 };
  }

  const { nodes } = processNode(content);
  return nodes[0] ?? content;
}

type Segment = { len: number; highlighted: boolean; color?: string };

/**
 * Highlights use ProseMirror positions (0-based). Document traversal matches.
 */
function getHighlightSegments(
  from: number,
  to: number,
  highlights: UserHighlight[],
): Segment[] {
  const overlapping = highlights.filter(
    (h) => h.fromPos < to && h.toPos > from,
  );
  if (overlapping.length === 0) {
    return [{ len: to - from, highlighted: false }];
  }

  const points: number[] = [from, to];
  for (const h of overlapping) {
    if (h.fromPos > from && h.fromPos < to) points.push(h.fromPos);
    if (h.toPos > from && h.toPos < to) points.push(h.toPos);
  }
  points.sort((a, b) => a - b);

  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segFrom = points[i];
    const segTo = points[i + 1];
    const len = segTo - segFrom;
    if (len <= 0) continue;

    const covering = overlapping.find(
      (h) => h.fromPos <= segFrom && h.toPos >= segTo,
    );
    segments.push({
      len,
      highlighted: !!covering,
      color: covering?.color,
    });
  }
  return segments;
}
