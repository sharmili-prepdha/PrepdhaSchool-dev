"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { SchoolWithContent } from "@/lib/contentMetadata/data";
import {
  createBook,
  createChapter,
  createTopic,
  createPage,
} from "@/features/contentMetadata/actions/metadata.actions";

type Props = {
  schools: SchoolWithContent[];
};

function matchesSearch(
  search: string,
  schoolName: string,
  className: string,
  subjectName: string,
  bookTitle: string,
  chapterTitle: string,
  topicTitle: string,
): boolean {
  const q = search.toLowerCase().trim();
  if (!q) return true;
  const haystack = [schoolName, className, subjectName, bookTitle, chapterTitle, topicTitle].join(" ").toLowerCase();
  return haystack.includes(q);
}

export function ContentMetadataTree({ schools }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = schools[0];
    if (schools.length === 1 && first?.classSubjects.length) {
      return new Set(first.classSubjects.slice(0, 5).map((cs) => `cs-${first.id}-${cs.id}`));
    }
    return new Set(schools.slice(0, 3).map((s) => `school-${s.id}`));
  });
  const [addBookCsId, setAddBookCsId] = useState<number | null>(null);
  const [addChapterBookId, setAddChapterBookId] = useState<number | null>(null);
  const [addTopicChapterId, setAddTopicChapterId] = useState<number | null>(null);
  const [addPageTopicId, setAddPageTopicId] = useState<number | null>(null);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCreateBook = async () => {
    if (!addBookCsId || !newBookTitle.trim()) return;
    setPending(true);
    setError(null);
    const result = await createBook(addBookCsId, newBookTitle.trim());
    setPending(false);
    if (result.success) {
      setAddBookCsId(null);
      setNewBookTitle("");
    } else setError(result.error);
  };

  const handleCreateChapter = async () => {
    if (!addChapterBookId || !newChapterTitle.trim()) return;
    setPending(true);
    setError(null);
    const result = await createChapter(addChapterBookId, newChapterTitle.trim());
    setPending(false);
    if (result.success) {
      setAddChapterBookId(null);
      setNewChapterTitle("");
    } else setError(result.error);
  };

  const handleCreateTopic = async () => {
    if (!addTopicChapterId || !newTopicTitle.trim()) return;
    setPending(true);
    setError(null);
    const result = await createTopic(addTopicChapterId, newTopicTitle.trim());
    setPending(false);
    if (result.success) {
      setAddTopicChapterId(null);
      setNewTopicTitle("");
    } else setError(result.error);
  };

  const handleCreatePage = async () => {
    if (!addPageTopicId) return;
    setPending(true);
    setError(null);
    const result = await createPage(addPageTopicId);
    setPending(false);
    if (result.success) setAddPageTopicId(null);
    else setError(result.error);
  };

  const filteredSchools = useMemo(() => {
    if (!search.trim()) return schools;
    return schools
      .map((school) => {
        const classSubjects = school.classSubjects.filter((cs) => {
          if (matchesSearch(search, school.name, cs.class.name, cs.subject.name, "", "", "")) return true;
          return cs.books.some((b) =>
            b.chapters.some((ch) =>
              ch.topics.some((t) =>
                matchesSearch(search, school.name, cs.class.name, cs.subject.name, b.title, ch.title, t.title),
              ),
            ),
          );
        });
        return { ...school, classSubjects };
      })
      .filter((s) => s.classSubjects.length > 0);
  }, [schools, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 max-w-sm"
        />
      </div>

      {filteredSchools.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {search ? "No matches." : "No content yet."}
        </p>
      ) : (
        <div className="space-y-0.5">
          {filteredSchools.map((school) => {
            const showSchool = schools.length > 1;
            const schoolOpen = expanded.has(`school-${school.id}`);

            return (
              <div key={school.id}>
                {showSchool && (
                  <button
                    type="button"
                    onClick={() => toggle(`school-${school.id}`)}
                    className="flex w-full items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/60 text-left text-sm font-medium"
                  >
                    {schoolOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    {school.name}
                  </button>
                )}

                {(showSchool ? schoolOpen : true) && (
                  <div className={showSchool ? "ml-4" : ""}>
                    {school.classSubjects.map((cs) => {
                      const csKey = `cs-${school.id}-${cs.id}`;
                      const csOpen = expanded.has(csKey);
                      const label = `${cs.class.name} · ${cs.subject.name}`;

                      return (
                        <div key={csKey}>
                          <div className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/40 group">
                            <button
                              type="button"
                              onClick={() => toggle(csKey)}
                              className="flex flex-1 items-center gap-2 text-left text-sm min-w-0"
                            >
                              {csOpen ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                              <span className="truncate">{label}</span>
                            </button>
                            <Dialog open={addBookCsId === cs.id} onOpenChange={(o) => !o && setAddBookCsId(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 opacity-60 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddBookCsId(cs.id);
                                  }}
                                  aria-label="Add textbook"
                                >
                                  <Plus className="size-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add textbook</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 py-2">
                                  <Label htmlFor="book-title">Name</Label>
                                  <Input
                                    id="book-title"
                                    value={newBookTitle}
                                    onChange={(e) => setNewBookTitle(e.target.value)}
                                    placeholder="e.g. Science Textbook"
                                  />
                                  {error && <p className="text-sm text-destructive">{error}</p>}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => { setAddBookCsId(null); setNewBookTitle(""); setError(null); }}>Cancel</Button>
                                  <Button onClick={handleCreateBook} disabled={pending || !newBookTitle.trim()}>{pending ? "Adding…" : "Add"}</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {csOpen && (
                            <div className="ml-4 border-l border-border/60 pl-2">
                              {cs.books.length === 0 ? (
                                <p className="py-2 text-xs text-muted-foreground">No textbooks</p>
                              ) : (
                                cs.books.map((book) => {
                                  const bookKey = `book-${book.id}`;
                                  const bookOpen = expanded.has(bookKey);
                                  return (
                                    <div key={book.id}>
                                      <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/30 group">
                                        <button
                                          type="button"
                                          onClick={() => toggle(bookKey)}
                                          className="flex flex-1 items-center gap-2 text-left text-sm min-w-0"
                                        >
                                          {bookOpen ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
                                          <span className="truncate">{book.title}</span>
                                        </button>
                                        <Dialog open={addChapterBookId === book.id} onOpenChange={(o) => !o && setAddChapterBookId(null)}>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 shrink-0 opacity-60 group-hover:opacity-100"
                                              onClick={(e) => { e.stopPropagation(); setAddChapterBookId(book.id); }}
                                              aria-label="Add chapter"
                                            >
                                              <Plus className="size-3" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader><DialogTitle>Add chapter</DialogTitle></DialogHeader>
                                            <div className="space-y-3 py-2">
                                              <Label htmlFor="chapter-title">Name</Label>
                                              <Input id="chapter-title" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="e.g. Food: Where Does It Come From?" />
                                              {error && <p className="text-sm text-destructive">{error}</p>}
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => { setAddChapterBookId(null); setNewChapterTitle(""); setError(null); }}>Cancel</Button>
                                              <Button onClick={handleCreateChapter} disabled={pending || !newChapterTitle.trim()}>{pending ? "Adding…" : "Add"}</Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>

                                      {bookOpen && (
                                        <div className="ml-4 border-l border-border/40 pl-2">
                                          {book.chapters.length === 0 ? (
                                            <p className="py-1.5 text-xs text-muted-foreground">No chapters</p>
                                          ) : (
                                            book.chapters.map((chapter) => {
                                              const chapterKey = `chapter-${chapter.id}`;
                                              const chapterOpen = expanded.has(chapterKey);
                                              return (
                                                <div key={chapter.id}>
                                                  <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/20 group">
                                                    <button
                                                      type="button"
                                                      onClick={() => toggle(chapterKey)}
                                                      className="flex flex-1 items-center gap-2 text-left text-sm min-w-0"
                                                    >
                                                      {chapterOpen ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />}
                                                      <span className="truncate">{chapter.title}</span>
                                                    </button>
                                                    <Dialog open={addTopicChapterId === chapter.id} onOpenChange={(o) => !o && setAddTopicChapterId(null)}>
                                                      <DialogTrigger asChild>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 shrink-0 opacity-60 group-hover:opacity-100"
                                                          onClick={(e) => { e.stopPropagation(); setAddTopicChapterId(chapter.id); }}
                                                          aria-label="Add topic"
                                                        >
                                                          <Plus className="size-3" />
                                                        </Button>
                                                      </DialogTrigger>
                                                      <DialogContent>
                                                        <DialogHeader><DialogTitle>Add topic</DialogTitle></DialogHeader>
                                                        <div className="space-y-3 py-2">
                                                          <Label htmlFor="topic-title">Name</Label>
                                                          <Input id="topic-title" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="e.g. Introduction" />
                                                          {error && <p className="text-sm text-destructive">{error}</p>}
                                                        </div>
                                                        <DialogFooter>
                                                          <Button variant="outline" onClick={() => { setAddTopicChapterId(null); setNewTopicTitle(""); setError(null); }}>Cancel</Button>
                                                          <Button onClick={handleCreateTopic} disabled={pending || !newTopicTitle.trim()}>{pending ? "Adding…" : "Add"}</Button>
                                                        </DialogFooter>
                                                      </DialogContent>
                                                    </Dialog>
                                                  </div>

                                                  {chapterOpen && (
                                                    <div className="ml-4 border-l border-border/30 pl-2">
                                                      {chapter.topics.length === 0 ? (
                                                        <p className="py-1.5 text-xs text-muted-foreground">No topics</p>
                                                      ) : (
                                                        chapter.topics.map((topic) => {
                                                          const topicKey = `topic-${topic.id}`;
                                                          const topicOpen = expanded.has(topicKey);
                                                          return (
                                                            <div key={topic.id}>
                                                              <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/20 group">
                                                                <button
                                                                  type="button"
                                                                  onClick={() => toggle(topicKey)}
                                                                  className="flex flex-1 items-center gap-2 text-left text-sm min-w-0"
                                                                >
                                                                  {topicOpen ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />}
                                                                  <span className="truncate">{topic.title}</span>
                                                                </button>
                                                                <Dialog open={addPageTopicId === topic.id} onOpenChange={(o) => !o && setAddPageTopicId(null)}>
                                                                  <DialogTrigger asChild>
                                                                    <Button
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      className="h-6 w-6 shrink-0 opacity-60 group-hover:opacity-100"
                                                                      onClick={(e) => { e.stopPropagation(); setAddPageTopicId(topic.id); }}
                                                                      aria-label="Add page"
                                                                    >
                                                                      <Plus className="size-3" />
                                                                    </Button>
                                                                  </DialogTrigger>
                                                                  <DialogContent>
                                                                    <DialogHeader><DialogTitle>Add page</DialogTitle></DialogHeader>
                                                                    <p className="text-sm text-muted-foreground py-2">Add a page to &quot;{topic.title}&quot;.</p>
                                                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                                                    <DialogFooter>
                                                                      <Button variant="outline" onClick={() => { setAddPageTopicId(null); setError(null); }}>Cancel</Button>
                                                                      <Button onClick={handleCreatePage} disabled={pending}>{pending ? "Adding…" : "Add"}</Button>
                                                                    </DialogFooter>
                                                                  </DialogContent>
                                                                </Dialog>
                                                              </div>

                                                              {topicOpen && (
                                                                <div className="ml-3">
                                                                  {topic.pages.length === 0 ? (
                                                                    <p className="py-1 text-xs text-muted-foreground">No pages</p>
                                                                  ) : (
                                                                    topic.pages.map((page) => (
                                                                      <div key={page.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/10 group">
                                                                        <span className="text-xs text-muted-foreground w-16">Page {page.page_order ?? "—"}</span>
                                                                        {!page.is_published && <span className="text-[10px] text-muted-foreground">Draft</span>}
                                                                        <Link
                                                                          href={`/editor?pageId=${page.id}`}
                                                                          className="ml-auto opacity-0 group-hover:opacity-100"
                                                                          title="Edit"
                                                                        >
                                                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                            <ExternalLink className="size-3" />
                                                                          </Button>
                                                                        </Link>
                                                                      </div>
                                                                    ))
                                                                  )}
                                                                </div>
                                                              )}
                                                            </div>
                                                          );
                                                        })
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
