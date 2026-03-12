import { queryOptions } from "@tanstack/react-query";
import { loadDocument } from "@/features/tiptap/actions/load-document.action";
import { loadPageHighlights } from "@/features/tiptap/actions/page-highlights.action";

export const bookReaderKeys = {
  all: ["book-reader"] as const,
  pageContent: (pageId: number) =>
    [...bookReaderKeys.all, "page", pageId] as const,
  pageHighlights: (pageId: number) =>
    [...bookReaderKeys.all, "page", pageId, "highlights"] as const,
};

export function pageContentQueryOptions(pageId: number) {
  return queryOptions({
    queryKey: bookReaderKeys.pageContent(pageId),
    queryFn: () => loadDocument({ pageId }),
    enabled: pageId > 0,
  });
}

export function pageHighlightsQueryOptions(pageId: number) {
  return queryOptions({
    queryKey: bookReaderKeys.pageHighlights(pageId),
    queryFn: () => loadPageHighlights({ pageId }),
    enabled: pageId > 0,
  });
}
