"use client";

import { useSyncExternalStore } from "react";
import { BookOpen } from "lucide-react";
import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";
import { BookReaderView } from "@/components/superAdmin/contentManagement/BookReaderView";
import { SubjectSidebar } from "@/app/superadmin/contentManagement/components/SubjectSidebar";
import { BooksGrid } from "@/app/superadmin/contentManagement/components/BooksGrid";
import { useContentManagementState } from "@/app/superadmin/contentManagement/hooks/useContentManagementState";

type Props = {
  classSubjects: ClassSubjectWithContent[];
};

export function ContentManagementView({ classSubjects }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const {
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
  } = useContentManagementState(classSubjects);

  if (effectiveSelectedBook) {
    if (!mounted) {
      return (
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      );
    }
    return (
      <BookReaderView
        book={effectiveSelectedBook.book}
        classSubject={effectiveSelectedBook.classSubject}
        onBack={handleBackFromBook}
        initialTopicId={Number.isFinite(parsedTopicId) ? parsedTopicId : null}
        bookIdForUrl={effectiveSelectedBook.book.id}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-row gap-4 m-10">
      <SubjectSidebar
        grouped={filteredGrouped}
        subjectSearch={subjectSearch}
        onSubjectSearchChange={setSubjectSearch}
        selectedClassSubjectId={selectedClassSubjectId}
        onSelectClassSubject={setSelectedClassSubjectId}
        isSubjectOpen={isSubjectOpen}
        onSubjectOpenChange={setSubjectOpen}
      />

      <section className="min-h-0 min-w-0  flex-1 ">
        {!selectedClassSubject ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <BookOpen className="mb-4 size-16 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Select a class and subject from the sidebar to view textbooks.
            </p>
          </div>
        ) : (
          <BooksGrid
            classSubject={selectedClassSubject}
            onBack={handleBackFromBooks}
            onSelectBook={handleSelectBook}
          />
        )}
      </section>
    </div>
  );
}
