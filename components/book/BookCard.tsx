"use client";

import { useState } from "react";

import { BookOpen, HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";

type Book = ClassSubjectWithContent["books"][number];

const BookCard = ({ book, onClick }: { book: Book; onClick?: () => void }) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false);
  const allTopics = book.chapters.flatMap((ch) => ch.topics);
  const showImage = book.thumbnail_url && !imageError;

  return (
    <Card
      className="flex h-62 w-48 shrink-0 flex-col self-start rounded-[20px] border-solid  border-grey-900  border-b-2   shadow-none"
      onClick={onClick}
    >
      <CardHeader
        className={cn(
          "relative flex-1 overflow-hidden min-h-[96px] rounded-t-[18px]",
          showImage ? "p-0" : "flex flex-row items-center gap-2.5 p-4 min-h-0",
        )}
      >
        {showImage ? (
          <>
            <Image
              src={book.thumbnail_url || ""}
              alt={book.title || ""}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              onError={() => setImageError(true)}
            />

            <CardTitle className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold text-white drop-shadow-md">
              {book.title}
            </CardTitle>
          </>
        ) : (
          <>
            <BookOpen className="size-9 shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">{book.title}</CardTitle>
          </>
        )}
        <Button
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-1.5 right-1.5 size-7 rounded-full bg-primary/10 hover:bg-primary/20"
        >
          <HeartIcon
            className={cn(
              "size-3.5",
              liked ? "fill-destructive stroke-destructive" : "fill-white stroke-white",
            )}
          />
          <span className="sr-only">Like</span>
        </Button>
      </CardHeader>
      <CardFooter className="justify-between gap-2 p-2.5">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chapters
          </span>
          <span className="text-base font-semibold">{book.chapters.length}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Topics
          </span>
          <span className="text-base font-semibold">{allTopics.length}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
