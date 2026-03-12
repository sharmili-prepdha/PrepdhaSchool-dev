"use client"
import { useMemo } from "react";
import { generateHTML, JSONContent } from "@tiptap/core";
import katex from "katex";
import "katex/dist/katex.min.css";
import { getExtensions } from "@/features/question-cards/components/editor/extensions";

interface JsonRendererProps {
  content: JSONContent;
}

// ─── Walk the JSON tree and replace inlineMath nodes with rendered KaTeX HTML ─

function collectAndReplaceKatex(node: JSONContent, map: Map<string, string>, counter: { n: number }): JSONContent {
  if (!node) return node;

  if (node.type === "inlineMath") {
    const latex = node.attrs?.latex ?? "";
    const placeholder = `KATEX_PLACEHOLDER_${counter.n++}`;
    let rendered = latex;
    try {
      rendered = katex.renderToString(latex, {
        throwOnError: false,
        output: "html",
        displayMode: false,
      });
    } catch {
      rendered = latex;
    }
    map.set(placeholder, rendered);
    // Replace node with a text node containing the placeholder
    return { type: "text", text: placeholder };
  }

  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map((child: JSONContent) => collectAndReplaceKatex(child, map, counter)),
    };
  }

  return node;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JsonRenderer({ content }: JsonRendererProps) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      // 1. Walk JSON, swap inlineMath nodes with placeholder text nodes,
      //    collect the rendered KaTeX HTML in a map.
      const katexMap = new Map<string, string>();
      const counter = { n: 0 };
      const processedContent = collectAndReplaceKatex(content, katexMap, counter);

      // 2. Generate HTML from the processed (math-free) JSON
      let html = generateHTML(processedContent, getExtensions(""));

      // 3. Replace every placeholder with the real KaTeX HTML
      katexMap.forEach((rendered, placeholder) => {
        html = html.replace(placeholder, rendered);
      });

      return html;
    } catch (e) {
      console.error("JsonRenderer error:", e);
      return "";
    }
  }, [content]);

  if (!html) return null;

  return (
    <div
      // Restore list styles (stripped by Tailwind preflight) + basic prose spacing
      className="
        leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
        [&_li]:my-1
        [&_p]:my-1
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3
        [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:my-2
        [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:my-2
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
        [&_img]:rounded-md [&_img]:border [&_img]:border-border [&_img]:my-2
        [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
        [&_strong]:font-bold
        [&_em]:italic
        [&_u]:underline
        [&_s]:line-through
        [&_.katex]:text-base
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
