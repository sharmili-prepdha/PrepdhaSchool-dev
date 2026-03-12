"use client";

import { useRef, useEffect } from "react";
import katex from "katex";

interface MathContentRendererProps {
  html: string;
  className?: string;
}

const katexOptions = {
  throwOnError: false,
  displayMode: false,
  output: "html" as const,
};

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Converts $...$ and $$...$$ in HTML string to data-type spans for KaTeX rendering.
 * Handles both TipTap math nodes and raw $...$ syntax.
 */
function preprocessMathInHtml(html: string): string {
  if (!html || !html.includes("$")) return html;

  // Match $$...$$ (block math) first
  let result = html.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    const trimmed = latex.trim();
    return `<span data-type="block-math" data-latex="${escapeHtmlAttr(trimmed)}"></span>`;
  });

  // Match $...$ (inline math) - avoid matching $$ or $ at boundaries
  result = result.replace(/(?<!\$)\$(?!\$)([^$]+)\$(?!\$)/g, (_, latex) => {
    const trimmed = latex.trim();
    return `<span data-type="inline-math" data-latex="${escapeHtmlAttr(trimmed)}"></span>`;
  });

  return result;
}

/**
 * Renders HTML content with support for:
 * - TipTap math nodes (data-type="inline-math" or "block-math")
 * - Raw $...$ and $$...$$ LaTeX syntax (converted to math nodes)
 * - Normal text and HTML
 */
export function MathContentRenderer({ html, className = "" }: MathContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const processedHtml = preprocessMathInHtml(html);
    container.innerHTML = processedHtml;

    const inlineMathElements = container.querySelectorAll<HTMLElement>(
      '[data-type="inline-math"][data-latex]',
    );
    inlineMathElements.forEach((el) => {
      const latex = el.getAttribute("data-latex");
      if (latex) {
        try {
          katex.render(latex, el, { ...katexOptions, displayMode: false });
        } catch {
          el.textContent = latex;
          el.classList.add("inline-math-error");
        }
      }
    });

    const blockMathElements = container.querySelectorAll<HTMLElement>(
      '[data-type="block-math"][data-latex]',
    );
    blockMathElements.forEach((el) => {
      const latex = el.getAttribute("data-latex");
      if (latex) {
        try {
          katex.render(latex, el, { ...katexOptions, displayMode: true });
        } catch {
          el.textContent = latex;
          el.classList.add("block-math-error");
        }
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-sm max-w-none [&_.katex]:text-[1.21em]! [&_.katex]:text-inherit! ${className}`}
    />
  );
}
