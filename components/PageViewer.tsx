"use client";

import { useCallback, useState } from "react";
import { RichTextContent } from "@/components/rich-text-editor/rich-text-content";
import { applyHighlightsToJson } from "@/lib/apply-highlights";
import type { UserHighlight } from "@/types/rich-text.types";
import type { JSONContent } from "@tiptap/react";

export type PageViewerProps = {
  topicId?: number;
  content: JSONContent;
  highlights?: UserHighlight[];
  enableHighlights?: boolean;
  pageId?: number;
  className?: string;
};

export function PageViewer({
  topicId,
  content,
  highlights: initialHighlights,
  enableHighlights = false,
  pageId,
  className,
}: PageViewerProps) {
  const [highlights, setHighlights] = useState<UserHighlight[]>(initialHighlights ?? []);
  const displayContent =
    highlights.length > 0 ? applyHighlightsToJson(content, highlights) : content;
  const handleHighlightsChange = useCallback((next: UserHighlight[]) => {
    setHighlights(next);
  }, []);

  return (
    <article className={className} data-testid="page-viewer" data-topic-id={topicId}>
      <RichTextContent
        key={
          enableHighlights
            ? `${pageId}-${highlights.length}-${highlights[highlights.length - 1]?.fromPos ?? 0}`
            : undefined
        }
        pageId={pageId!}
        content={displayContent}
        className="prose prose-slate max-w-none"
        enableHighlights={enableHighlights}
        highlights={highlights}
        onHighlightsChange={handleHighlightsChange}
      />
    </article>
  );
}
