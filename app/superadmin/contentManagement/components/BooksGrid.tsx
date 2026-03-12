"use client";

import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/book/BookCard";
import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";
import { AddBookDialog } from "@/app/superadmin/contentManagement/components/AddBookDialog";
import { useAddBookDialog } from "@/app/superadmin/contentManagement/hooks/useAddBookDialog";

type Book = ClassSubjectWithContent["books"][number];

type BooksGridProps = {
  classSubject: ClassSubjectWithContent;
  onBack: () => void;
  onSelectBook: (book: Book, classSubject: ClassSubjectWithContent) => void;
};

export function BooksGrid({ classSubject, onBack, onSelectBook }: BooksGridProps) {
  const addBook = useAddBookDialog();

  const handleAddBookSubmit = async () => {
    await addBook.submit(classSubject.id, addBook.title);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={onBack}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
          <h2 className="text-lg font-semibold">
            {classSubject.class.name} · {classSubject.subject.name}
          </h2>
        </div>
        <Button size="sm" variant="outline" onClick={addBook.open}>
          <Plus className="mr-1.5 size-4" />
          Add textbook
        </Button>
      </div>

      <div className="grid gap-4 m-8 sm:grid-cols-2 max-h-[calc(100dvh-16rem)] overflow-y-auto md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      
        {classSubject.books.map((book) => (
          <BookCard key={book.id} book={book} onClick={() => onSelectBook(book, classSubject)} />
        ))}
      </div>

      <AddBookDialog
        open={addBook.isOpen}
        onOpenChange={(open) => (open ? addBook.open() : addBook.close())}
        title={addBook.title}
        onTitleChange={addBook.setTitle}
        error={addBook.error}
        isPending={addBook.isPending}
        onSubmit={handleAddBookSubmit}
        onCancel={addBook.close}
      />
    </div>
  );
}
