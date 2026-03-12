"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";
import { AddTopicCard, TopicCard } from "@/components/book/TopicCard";
import { ReaderPane } from "@/components/book/ReaderPane";
import { AddChapterDialog } from "./AddChapterDialog";
import { AddTopicDialog } from "./AddTopicDialog";
import ChapterCard from "@/components/chapter/ChapterCard";

type Book = ClassSubjectWithContent["books"][number];
type Chapter = Book["chapters"][number];
type Topic = Chapter["topics"][number];

function firstPageOfTopic(topic: Topic) {
  if (topic.pages.length === 0) return null;
  return [...topic.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0))[0];
}

function topicProgressPercent(topic: Topic): number {
  if (topic.pages.length === 0) return 0;
  const published = topic.pages.filter((p) => p.is_published).length;
  return Math.round((published / topic.pages.length) * 100);
}

function allTopicsFromBook(book: Book): Topic[] {
  return book.chapters.flatMap((ch) => ch.topics);
}

type TopicMetadata = {
  grade: number | null;
  subject: string | null;
  textbookName: string | null;
  chapter: string | null;
  title: string | null;
};

type Props = {
  book: Book;
  classSubject: ClassSubjectWithContent;
  onBack: () => void;
  initialTopicId?: number | null;
  /** When provided, topic selection is synced to URL for SSR/sharing */
  bookIdForUrl?: number;
};

function getInitialTopicId(book: Book): number | null {
  const topics = allTopicsFromBook(book);
  const firstWithPage = topics.find((t) => firstPageOfTopic(t));
  return firstWithPage?.id ?? topics[0]?.id ?? null;
}

function getInitialExpandedChapterIds(book: Book, topicId: number | null): Set<number> {
  if (topicId) {
    const chapter = book.chapters.find((ch) => ch.topics.some((t) => t.id === topicId));
    if (chapter) return new Set([chapter.id]);
  }
  const firstWithTopic = book.chapters.find((ch) => ch.topics.length > 0);
  return firstWithTopic ? new Set([firstWithTopic.id]) : new Set();
}

function getTopicMetadata(
  book: Book,
  classSubject: ClassSubjectWithContent,
  topicId: number | null,
): TopicMetadata | null {
  if (!topicId) return null;
  for (const chapter of book.chapters) {
    const topic = chapter.topics.find((t) => t.id === topicId);
    if (topic) {
      return {
        grade: classSubject.class_id,
        subject: classSubject.subject.name,
        textbookName: book.title,
        chapter: chapter.title,
        title: topic.title,
      };
    }
  }
  return null;
}

export function BookReaderView({
  book,
  classSubject,
  onBack,
  initialTopicId,
  bookIdForUrl,
}: Props) {
  const router = useRouter();
  const [topicSearch, setTopicSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(
    () => initialTopicId ?? getInitialTopicId(book),
  );
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [addTopicChapterId, setAddTopicChapterId] = useState<number | null>(null);
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<number>>(() =>
    getInitialExpandedChapterIds(book, initialTopicId ?? getInitialTopicId(book)),
  );

  const allTopics = useMemo(() => allTopicsFromBook(book), [book]);
  const selectedTopic = useMemo(
    () => allTopics.find((t) => t.id === selectedTopicId),
    [allTopics, selectedTopicId],
  );
  const sortedPages = useMemo(() => {
    if (!selectedTopic?.pages.length) return [];
    return [...selectedTopic.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0));
  }, [selectedTopic]);

  const topicMetadata = useMemo(
    () => getTopicMetadata(book, classSubject, selectedTopicId),
    [book, classSubject, selectedTopicId],
  );

  const selectTopic = useCallback(
    (topicId: number) => {
      setSelectedTopicId(topicId);
      const chapter = book.chapters.find((ch) => ch.topics.some((t) => t.id === topicId));
      if (chapter) {
        setExpandedChapterIds((prev) => new Set(prev).add(chapter.id));
      }
      if (bookIdForUrl != null) {
        const params = new URLSearchParams();
        params.set("bookId", String(bookIdForUrl));
        params.set("topicId", String(topicId));
        router.replace(`/superadmin/contentManagement?${params.toString()}`, { scroll: false });
      }
    },
    [book.chapters, bookIdForUrl, router],
  );

  const filteredChapters = useMemo(
    () =>
      topicSearch.trim()
        ? book.chapters
            .map((ch) => ({
              chapter: ch,
              topics: ch.topics.filter((t) =>
                t.title.toLowerCase().includes(topicSearch.toLowerCase().trim()),
              ),
            }))
            .filter(({ topics }) => topics.length > 0)
        : book.chapters.map((ch) => ({ chapter: ch, topics: ch.topics })),
    [book.chapters, topicSearch],
  );

  const selectFirstTopicWithContent = useCallback(() => {
    const firstWithPage = allTopics.find((t) => firstPageOfTopic(t));
    if (firstWithPage) selectTopic(firstWithPage.id);
    else if (allTopics.length > 0) selectTopic(allTopics[0].id);
  }, [allTopics, selectTopic]);

  const handleAddPage = useCallback(() => {
    if (!selectedTopicId) return;
    router.push(`/editor?topicId=${selectedTopicId}`);
  }, [selectedTopicId, router]);

  const handleAddMcq = useCallback(() => {
     if (!selectedTopicId) return;
    router.push(`/mcq/create?topicId=${selectedTopicId}`);
  }, [selectedTopicId, router])

  const hasPages = sortedPages.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-row gap-4 overflow-hidden p-10">
      <aside className="flex h-full w-72 shrink-0 flex-col rounded-xl border border-sidebar-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-sidebar-border p-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Back to books"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 truncate text-sm font-semibold text-sidebar-foreground">
              <BookOpen className="size-4 shrink-0" />
              Chapters
            </h2>
            <p className="truncate text-xs text-muted-foreground">{book.title}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => setAddChapterOpen(true)}
            aria-label="Add chapter"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="border-b border-sidebar-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search within this book..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="h-8 rounded-lg border-sidebar-border bg-background/50 pl-8 text-sm"
            />
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Chapters">
          {filteredChapters.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {topicSearch ? "No matches." : "No chapters yet."}
              </p>
              {!topicSearch && (
                <Button size="sm" onClick={() => setAddChapterOpen(true)} className="gap-1.5">
                  <Plus className="size-4" />
                  Add first chapter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChapters.map(({ chapter, topics }) => {
                const isExpanded = expandedChapterIds.has(chapter.id);
                const hasSelectedTopic = topics.some((t) => t.id === selectedTopicId);
                return (
                  <Collapsible
                    key={chapter.id}
                    open={isExpanded}
                    onOpenChange={(open) =>
                      setExpandedChapterIds((prev) => {
                        const next = new Set(prev);
                        if (open) next.add(chapter.id);
                        else next.delete(chapter.id);
                        return next;
                      })
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <ChapterCard title={chapter.title} hasSelectedTopic={hasSelectedTopic} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 pl-2 grid grid-cols-2 gap-2">
                        {topics.length === 0 ? (
                          <AddTopicCard onClick={() => setAddTopicChapterId(chapter.id)} />
                        ) : (
                          <>
                            {topics.map((topic) => {
                              const isSelected = topic.id === selectedTopicId;
                              const progress = topicProgressPercent(topic);
                              return (
                                <TopicCard
                                  key={topic.id}
                                  onClick={() => selectTopic(topic.id)}
                                  isSelected={isSelected}
                                  progress={progress}
                                  topic={{ ...topic, chapter_id: chapter.id }}
                                />
                              );
                            })}
                            <AddTopicCard onClick={() => setAddTopicChapterId(chapter.id)} />
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      <AddChapterDialog open={addChapterOpen} onOpenChange={setAddChapterOpen} bookId={book.id} />
      <AddTopicDialog
        open={addTopicChapterId != null}
        onOpenChange={(open) => !open && setAddTopicChapterId(null)}
        chapterId={addTopicChapterId}
      />

      <section className="min-h-0  min-w-0 flex-1 overflow-y-auto">
        {!selectedTopicId ? (
          <div className="flex  flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">
              Select a topic from the sidebar to view its content.
            </p>
            {allTopics.length > 0 && (
              <button
                type="button"
                onClick={selectFirstTopicWithContent}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Open first topic
              </button>
            )}
          </div>
        ) : hasPages ? (
          <div className="mx-auto max-w-3xl p-8">
            <div className="mb-4 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleAddPage} className="gap-1.5">
                <Plus className="size-4" />
                Add page
              </Button>
            </div>
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMcq}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Add MCQ
              </Button>
            </div>
            <ReaderPane
              topicId={selectedTopicId ?? undefined}
              pages={sortedPages}
              metadata={topicMetadata}
            />
          </div>
        ) : (
          <div className="flex  flex-col items-center justify-center gap-4 p-12 text-center">
            <p className="text-muted-foreground">This topic has no content yet.</p>
            <Button size="sm" onClick={handleAddPage} className="gap-1.5">
              <Plus className="size-4" />
              Add page
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
