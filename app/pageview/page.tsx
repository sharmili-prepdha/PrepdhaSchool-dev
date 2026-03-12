import { PageViewWithHeader } from "@/components/PageViewWithHeader";
import { loadDocument } from "@/features/tiptap/actions/load-document.action";
import { loadPageHighlights } from "@/features/tiptap/actions/page-highlights.action";

type PageViewProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function PageView({ searchParams }: PageViewProps) {
  const params = await searchParams;
  const pageIdParam = params?.id;

  if (!pageIdParam) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-2">No page specified.</p>
        <p className="text-muted-foreground text-sm">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5">/pageview?id=pageId</code> to
          view a page.
        </p>
      </div>
    );
  }

  const pageId = parseInt(pageIdParam, 10);
  if (Number.isNaN(pageId)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive mb-2">Invalid page ID.</p>
      </div>
    );
  }

  const result = await loadDocument({ pageId });

  if (!result.success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive mb-2">Failed to load page</p>
        <p className="text-muted-foreground text-sm">{result.error}</p>
      </div>
    );
  }

  const highlightsResult = await loadPageHighlights({ pageId });
  const highlights =
    highlightsResult.success && highlightsResult.highlights.length > 0
      ? highlightsResult.highlights
      : undefined;

  return (
    <PageViewWithHeader
      pageId={pageId}
      content={result.content}
      metadata={result.metadata}
      highlights={highlights}
    />
  );
}
