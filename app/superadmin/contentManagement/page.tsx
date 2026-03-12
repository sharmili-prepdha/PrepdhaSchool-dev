import { Suspense } from "react";
import { dehydrate, getQueryClient, HydrationBoundary } from "@/lib/query";
import {
  fetchAllClassSubjectsWithContent,
  type ClassSubjectWithContent,
} from "@/lib/contentMetadata/data";
import { ContentManagementView } from "@/components/superAdmin/contentManagement/ContentManagementView";
import { pageContentQueryOptions } from "@/lib/query/book-reader-queries";

type Book = ClassSubjectWithContent["books"][number];
type Topic = Book["chapters"][number]["topics"][number];

function firstPageIdOfTopic(topic: Topic): number | null {
  if (topic.pages.length === 0) return null;
  const sorted = [...topic.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0));
  return sorted[0]?.id ?? null;
}

function firstPageIdFromBook(book: Book, topicId?: number | null): number | null {
  const topics = book.chapters.flatMap((ch) => ch.topics);
  const target = topicId
    ? topics.find((t) => t.id === topicId)
    : topics.find((t) => firstPageIdOfTopic(t));
  if (!target) return topics[0] ? firstPageIdOfTopic(topics[0]) : null;
  return firstPageIdOfTopic(target);
}

export default async function ContentManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string; topicId?: string }>;
}) {
  const classSubjects = await fetchAllClassSubjectsWithContent();
  const params = await searchParams;
  const bookIdParam = params?.bookId ? Number.parseInt(params.bookId, 10) : NaN;
  const topicIdParam = params?.topicId ? Number.parseInt(params.topicId, 10) : NaN;

  const queryClient = getQueryClient();
  const book =
    Number.isFinite(bookIdParam) &&
    classSubjects.flatMap((cs) => cs.books).find((b) => b.id === bookIdParam);

  if (book) {
    const pageId = firstPageIdFromBook(book, Number.isFinite(topicIdParam) ? topicIdParam : null);
    if (pageId) {
      await queryClient.prefetchQuery(pageContentQueryOptions(pageId));
    }
  }

  return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className="flex flex-1 items-center justify-center">Loading…</div>}>
          <ContentManagementView classSubjects={classSubjects} />
        </Suspense>
      </HydrationBoundary>
  );
}
