"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageViewer } from "@/components/PageViewer";
import {
  pageContentQueryOptions,
  pageHighlightsQueryOptions,
} from "@/lib/query/book-reader-queries";

type Page = {
  id: number;
  page_order: number | null;
  is_published?: boolean;
};

type TopicMetadata = {
  grade: number | null;
  subject: string | null;
  textbookName: string | null;
  chapter: string | null;
  title: string | null;
};

type ReaderPaneProps = {
  topicId?: number;
  pages: Page[];
  metadata?: TopicMetadata | null;
};

function sortPages(pages: Page[]) {
  return [...pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0));
}

const PLACEHOLDER_CLASS =
  "flex min-h-[400px] items-center justify-center text-muted-foreground text-sm";
const ERROR_CLASS = "flex min-h-[400px] items-center justify-center text-destructive text-sm";

function useInView(rootMargin = "200px", threshold = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

function LazyPageSlot({
  pageId,
  pageOrder,
  topicId,
}: {
  pageId: number;
  pageOrder?: number;
  topicId?: number;
}) {
  const { ref, inView } = useInView("300px");

  const {
    data: pageResult,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...pageContentQueryOptions(pageId),
    enabled: inView && pageId > 0,
  });

  const { data: highlightsResult } = useQuery({
    ...pageHighlightsQueryOptions(pageId),
    enabled: inView && pageId > 0,
  });

  const success = pageResult && "success" in pageResult && pageResult.success;
  const hasContent = success ? pageResult.content : null;
  const resolvedPageId = success ? pageResult.pageId : undefined;
  const highlights =
    highlightsResult?.success && highlightsResult.highlights.length > 0
      ? highlightsResult.highlights
      : undefined;
  const contentError =
    pageResult && "success" in pageResult && !pageResult.success ? pageResult.error : null;

  return (
    <div ref={ref} className="min-h-[400px]" data-page-id={pageId}>
      {!inView ? (
        <div className={PLACEHOLDER_CLASS}>Page {pageOrder ?? "—"}</div>
      ) : isLoading ? (
        <div className={PLACEHOLDER_CLASS}>Loading…</div>
      ) : isError || contentError ? (
        <div className={ERROR_CLASS}>
          {contentError ?? (error instanceof Error ? error.message : "Failed to load")}
        </div>
      ) : hasContent ? (
        <PageViewer
          key={`${resolvedPageId}-${highlights?.length ?? 0}-${highlights?.[highlights.length - 1]?.fromPos ?? 0}`}
          topicId={topicId}
          content={hasContent}
          enableHighlights
          pageId={resolvedPageId}
          highlights={highlights}
        />
      ) : null}
    </div>
  );
}

export function ReaderPane({ topicId, pages, metadata }: ReaderPaneProps) {
  const sortedPages = sortPages(pages);

  if (sortedPages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {metadata && (
        <div >
          <div className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
            {metadata.grade != null && <span>Class {metadata.grade}</span>}
            {metadata.subject && (
              <>
                <span aria-hidden>·</span>
                <span>{metadata.subject}</span>
              </>
            )}
            {metadata.textbookName && (
              <>
                <span aria-hidden>·</span>
                <span>{metadata.textbookName}</span>
              </>
            )}
            {metadata.chapter && (
              <>
                <span aria-hidden>·</span>
                <span>Chapter {metadata.chapter}</span>
              </>
            )}
          </div>
          {metadata.title && (
            <h1 className="mt-2 text-xl font-semibold text-slate-900">{metadata.title}</h1>
          )}
        </div>
      )}

      {sortedPages.map((page) => (
        <LazyPageSlot
          key={page.id}
          pageId={page.id}
          topicId={topicId}
          pageOrder={page.page_order ?? undefined}
        />
      ))}
    </div>
  );
}
