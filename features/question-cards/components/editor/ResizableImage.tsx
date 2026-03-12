"use client";

import { Image } from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";

// ─── React component rendered inside the editor for each image ───────────────

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Width stored in node attrs (px value as number, or "100%" as default)
  const width: number | string = node.attrs.width ?? "100%";

  const startResize = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth =
        imgRef.current?.getBoundingClientRect().width ?? 300;

      setIsResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(80, Math.round(startWidth + delta)); // min 80px
        updateAttributes({ width: newWidth });
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      className="inline-block relative my-4"
      style={{ width: typeof width === "number" ? `${width}px` : width }}
      data-drag-handle
    >
      <div ref={containerRef} className="relative inline-block w-full group">
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? ""}
          style={{ width: "100%", display: "block" }}
          className={`rounded-md border border-border ${
            selected ? "ring-2 ring-primary ring-offset-1" : ""
          } ${isResizing ? "pointer-events-none select-none" : ""}`}
          draggable={false}
        />

        {/* Show resize handle when image is selected */}
        {selected && (
          <div
            onMouseDown={startResize}
            title="Drag to resize"
            className="absolute bottom-0 right-0 w-4 h-4 cursor-ew-resize
              bg-primary rounded-tl-md rounded-br-md
              flex items-center justify-center opacity-90
              hover:opacity-100 transition-opacity z-10"
            style={{ userSelect: "none" }}
          >
            {/* Grip dots */}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <circle cx="3" cy="3" r="1.2" />
              <circle cx="7" cy="3" r="1.2" />
              <circle cx="3" cy="7" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
            </svg>
          </div>
        )}

        {/* Width badge shown while resizing */}
        {isResizing && typeof width === "number" && (
          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded pointer-events-none">
            {width}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ─── Extended Tiptap Node ─────────────────────────────────────────────────────

export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      // Store pixel width; null means "full width"
      width: {
        default: null,
        parseHTML: (el) => {
          const w = (el as HTMLImageElement).style.width || el.getAttribute("width");
          if (!w) return null;
          const parsed = parseInt(w);
          return isNaN(parsed) ? null : parsed;
        },
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { style: `width: ${attrs.width}px`, width: attrs.width };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});