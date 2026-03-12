"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";
import { groupBySubject } from "../utils/groupBySubject";

type BookSelection = {
  book: ClassSubjectWithContent["books"][number];
  classSubject: ClassSubjectWithContent;
};

function findBookFromUrl(
  classSubjects: ClassSubjectWithContent[],
  bookId: number,
): BookSelection | null {
  if (!Number.isFinite(bookId)) return null;
  for (const cs of classSubjects) {
    const book = cs.books.find((b) => b.id === bookId);
    if (book) return { book, classSubject: cs };
  }
  return null;
}

export function useContentManagementState(classSubjects: ClassSubjectWithContent[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookIdFromUrl = searchParams.get("bookId");
  const topicIdFromUrl = searchParams.get("topicId");
  const parsedBookId = bookIdFromUrl ? Number.parseInt(bookIdFromUrl, 10) : NaN;
  const parsedTopicId = topicIdFromUrl ? Number.parseInt(topicIdFromUrl, 10) : NaN;

  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookSelection | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => groupBySubject(classSubjects), [classSubjects]);

  const filteredGrouped = useMemo(() => {
    if (!subjectSearch.trim()) return grouped;
    const q = subjectSearch.toLowerCase().trim();
    return grouped
      .map(([subjectName, items]) => {
        const matches = items.filter(
          (cs) =>
            subjectName.toLowerCase().includes(q) ||
            cs.class.name.toLowerCase().includes(q),
        );
        return [subjectName, matches] as [string, ClassSubjectWithContent[]];
      })
      .filter(([, items]) => items.length > 0);
  }, [grouped, subjectSearch]);

  const selectedClassSubject = useMemo(
    () => classSubjects.find((cs) => cs.id === selectedClassSubjectId) ?? null,
    [classSubjects, selectedClassSubjectId],
  );

  const selectedBookFromUrl = useMemo(
    () => findBookFromUrl(classSubjects, parsedBookId),
    [classSubjects, parsedBookId],
  );

  const effectiveSelectedBook = selectedBook ?? selectedBookFromUrl;

  const setSubjectOpen = (subjectName: string, open: boolean) => {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev);
      if (open) next.delete(subjectName);
      else next.add(subjectName);
      return next;
    });
  };

  const isSubjectOpen = (subjectName: string) => !collapsedSubjects.has(subjectName);

  const handleSelectBook = (
    book: ClassSubjectWithContent["books"][number],
    classSubject: ClassSubjectWithContent,
  ) => {
    setSelectedBook({ book, classSubject });
    const params = new URLSearchParams(searchParams);
    params.set("bookId", String(book.id));
    router.push(`/superadmin/contentManagement?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleBackFromBooks = () => setSelectedClassSubjectId(null);

  const handleBackFromBook = () => {
    setSelectedBook(null);
    router.push("/superadmin/contentManagement", { scroll: false });
  };

  return {
    selectedClassSubjectId,
    setSelectedClassSubjectId,
    selectedClassSubject,
    effectiveSelectedBook,
    parsedTopicId,
    subjectSearch,
    setSubjectSearch,
    filteredGrouped,
    isSubjectOpen,
    setSubjectOpen,
    handleSelectBook,
    handleBackFromBooks,
    handleBackFromBook,
  };
}
