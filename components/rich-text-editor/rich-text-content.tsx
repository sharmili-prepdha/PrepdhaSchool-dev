"use client";

import Link from "next/link";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Pencil } from "lucide-react";

import "katex/dist/katex.min.css";

import { Mcq } from "@/extensions/mcq";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserHighlight } from "@/types/rich-text.types";
import { HighlightToolbar } from "./HighlightToolbar";
import { useHighlightSelection } from "./useHighlightSelection";

/**
 * Read-only extensions: same node types as the editor (so saved JSON renders correctly)
 * but without editing features (no FileHandler, ImageUploadNode, UniqueID).
 */
export function getReadOnlyExtensions() {
  return [
    StarterKit.configure({
      bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
      orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
      codeBlock: {
        HTMLAttributes: {
          class: "rounded-md bg-stone-100 p-2 font-mono font-medium text-stone-950",
        },
      },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Mcq,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Youtube.configure({ controls: true, nocookie: true }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Image.configure({
      inline: false,
    }),
  ];
}

export type RichTextContentProps = {
  content: JSONContent;
  pageId: number;
  className?: string;
  /** When true, enables text selection and highlight toolbar instead of edit button */
  enableHighlights?: boolean;
  highlights?: UserHighlight[];
  onHighlightsChange?: (highlights: UserHighlight[]) => void;
};

/**
 * Renders saved rich-text JSON in read-only mode.
 * Use this for "view" / "read" UIs: same JSON you save from the editor
 * renders here with correct blocks (paragraphs, images, MCQ, tables, math, etc.).
 * For React Native, use the same JSON with a custom renderer that maps node types
 * to native components.
 */
export function RichTextContent({
  pageId,
  content,
  className,
  enableHighlights = false,
  highlights = [],
  onHighlightsChange = () => {},
}: RichTextContentProps) {
  const editor = useEditor({
    extensions: getReadOnlyExtensions(),
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate max-w-none focus:outline-none rounded-md border-0 bg-transparent py-0 px-0",
          enableHighlights && "select-text cursor-text",
        ),
      },
    },
    immediatelyRender: false,
  });

  const highlightSelection = useHighlightSelection({
    editor,
    enabled: enableHighlights,
    pageId,
    highlights,
    onHighlightsChange,
  });

  if (!editor) return null;

  const showHighlightToolbar =
    enableHighlights && highlightSelection.selection && highlightSelection.toolbarRect;

  return (
    <div className={cn("relative", className)}>
      <div
        className="rounded-3xl border-2 border-b-6 border-border bg-card/50 px-4 py-3 transition-colors"
        onContextMenu={enableHighlights ? highlightSelection.handleContextMenu : undefined}
      >
        <div className={enableHighlights ? undefined : "flex flex-row justify-between"}>
          <Badge
            variant="outline"
            className="rounded-2xl border-0 bg-primary px-3 py-1 text-primary-foreground mb-4"
          >
            <span className="mr-2 size-1.5 shrink-0 rounded-full bg-primary-foreground" />
            Part {pageId}
          </Badge>
          {!enableHighlights && (
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium" asChild>
              <Link href={`/editor?pageId=${pageId}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          )}
        </div>
        <EditorContent editor={editor} />
      </div>
      {showHighlightToolbar && highlightSelection.toolbarRect && (
        <HighlightToolbar
          toolbarRect={highlightSelection.toolbarRect}
          selectedText={highlightSelection.selectedText}
          onHighlight={highlightSelection.handleHighlight}
          onUnhighlight={highlightSelection.handleUnhighlight}
          canUnhighlight={highlightSelection.hasOverlappingHighlights}
          isSaving={highlightSelection.isSaving}
          saveError={highlightSelection.saveError}
          pageId={pageId}
        />
      )}
    </div>
  );
}
