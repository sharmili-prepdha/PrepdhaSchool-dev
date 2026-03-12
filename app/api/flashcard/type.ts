import { Flashcard, StudentFlashcardState } from "@/app/generated/prisma/client";

export type NextCard = {
  flashcard: Flashcard;
  reviewState: StudentFlashcardState | null;
  type?: "review" | "new";
  dueAt?: number;
  isRepeat?: boolean;
};
