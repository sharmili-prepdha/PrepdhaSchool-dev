"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flashcard } from "@/app/generated/prisma/client";
import { updateFlashcard } from "@/features/flashcard/action/flashcard.action";

export function FlashcardEdit({
  currentCard,
  onEdit,
  onCancel,
}: {
  currentCard: Flashcard;
  onEdit: (updatedCard: Flashcard) => void;
  onCancel: () => void;
}) {
  const question = (currentCard.question as Record<string, string>)?.text ?? "";
  const answer = (currentCard.answer as Record<string, string>)?.correct ?? "";

  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);

  const handleSaveEdit = async () => {
    const updatedData = {
      question: {
        text: editedQuestion,
        type: "text",
      },
      answer: {
        correct: editedAnswer,
      },
    };
    const flashcard = await updateFlashcard(currentCard.id, updatedData);
    if (flashcard?.data) {
      onEdit(flashcard.data);
    }

    onCancel();
  };

  return (
    <div className="w-full space-y-1 xs:space-y-2">
      <div className="space-y-1 xs:space-y-2">
        <label className="text-base xs:text-xs sm:text-sm font-medium text-foreground">
          Question
        </label>
        <Input
          value={editedQuestion}
          onChange={(e) => setEditedQuestion(e.target.value)}
          className="text-xs xs:text-sm sm:text-base md:text-lg"
          placeholder="Enter question"
        />
      </div>

      <div className="space-y-1 xs:space-y-2">
        <label className="text-base xs:text-xs sm:text-sm font-medium text-foreground">
          Answer
        </label>
        <Input
          value={editedAnswer}
          onChange={(e) => setEditedAnswer(e.target.value)}
          className="text-xs xs:text-sm sm:text-base md:text-lg"
          placeholder="Enter answer"
        />
      </div>

      <div className="flex flex-col gap-2 mt-5">
        <Button onClick={handleSaveEdit} className="bg-violet-500">
          Save
        </Button>
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>
      </div>
    </div>
  );
}