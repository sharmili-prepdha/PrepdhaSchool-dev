"use client";

import { FlashcardLayout } from "./FlashcardLayout";
import { FlashcardSide } from "./FlashcardSide";

import { FlashcardCommonProps } from "@/features/flashcard/types/flashcard";

interface FlashcardContainerProps extends FlashcardCommonProps {
  showAnswer: boolean;
}

export default function FlashcardContainer({
  showAnswer,
  isEditing,
  ...props
}: FlashcardContainerProps) {
  return (
    <FlashcardLayout
      flipped={!isEditing && showAnswer}
      className="w-[clamp(320px,60vw,960px)] sm:aspect-video sm:h-auto h-80 mx-auto"
    >
      <FlashcardSide side="front" isEditing={isEditing} {...props} />
      <FlashcardSide side="back" isEditing={isEditing} {...props} />
    </FlashcardLayout>
  );
}
