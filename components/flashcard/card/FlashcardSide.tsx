"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnswerContent,
  FlashcardCommonProps,
  QuestionContent,
} from "@/features/flashcard/types/flashcard";
import { FlashcardEdit } from "./FlashcardEdit";
import { deleteFlashcardAction } from "@/features/flashcard/action/flashcard.action";

interface FlashcardSideProps extends FlashcardCommonProps {
  side: "front" | "back";
}

export function FlashcardSide({
  side,
  currentCard,
  onEdit,
  currentCardIndex,
  flashcardLength,
  onReveal,
  onFlipBack,
  onEditActive,
  onDelete,
  onEditCancel,
  isEditing,
  cardClassName,
  headerAccentClassName,
  handleAccuracy,
  isRepeat,
}: FlashcardSideProps) {
  const isBack = side === "back";
  const access = currentCard?.id === undefined || currentCard?.scope === "global";
  const question = (currentCard?.question as unknown as QuestionContent)?.text ?? "";
  const answer = (currentCard?.answer as unknown as AnswerContent)?.correct ?? "";
  const accuracy = handleAccuracy();

  const handleCardDelete = async (cardId: number) => {
    await deleteFlashcardAction(cardId);
    onDelete();
  };

  return (
    <Card
      className={cn(
        "absolute inset-0 w-full h-full",
        "border border-b-4 border-gray-500 bg-white shadow-2xl rounded-3xl",
        "flex flex-col overflow-hidden",
        side === "back" && "rotate-y-180 backface-hidden",
        side === "front" && "backface-hidden",
        cardClassName,
      )}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-4 py-3 px-6 border-b">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1 text-[11px] uppercase font-bold tracking-wider rounded-full border",
              headerAccentClassName || "bg-zinc-100 text-zinc-700 border-zinc-200",
            )}
          >
            {isBack ? "Back Side" : "Front Side"}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={cn(
              "text-xs font-bold tabular-nums px-3 py-1 rounded-full border",
              headerAccentClassName || "bg-zinc-100 text-zinc-500 border-zinc-200",
            )}
          >
            {flashcardLength && currentCardIndex < flashcardLength
              ? currentCardIndex + 1
              : currentCardIndex}{" "}
            / {flashcardLength}
          </span>

          <div className={cn("flex items-center gap-1", access && "opacity-30 cursor-not-allowed")}>
            <Button
              size="icon"
              variant="ghost"
              disabled={access}
              onClick={onEditActive}
              className="h-8 w-8 text-blue-400 hover:bg-blue-500 hover:text-white rounded-full transition-all disabled:cursor-not-allowed"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={access}
              onClick={() => handleCardDelete(currentCard?.id)}
              className="h-8 w-8 text-rose-400 hover:bg-rose-500 hover:text-white rounded-full transition-all disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content — tap to flip when not editing */}
      <CardContent
        className={cn(
          "flex-1 flex items-center justify-center p-6 sm:p-10 text-center overflow-hidden",
          !isEditing && "cursor-pointer select-none",
        )}
        role={isEditing ? undefined : "button"}
        tabIndex={isEditing ? undefined : 0}
        onClick={isEditing ? undefined : isBack ? onFlipBack : onReveal}
        onKeyDown={
          isEditing
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isBack) {
                    onFlipBack?.();
                  } else {
                    onReveal();
                  }
                }
              }
        }
      >
        {isEditing ? (
          <div className="w-full">
            <FlashcardEdit currentCard={currentCard} onCancel={onEditCancel} onEdit={onEdit} />
          </div>
        ) : isBack ? (
          <div className="space-y-6 w-full animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-base sm:text-lg font-medium text-zinc-500 leading-relaxed">
              {question}
            </p>
            <div className="h-px w-20 bg-zinc-200 mx-auto" />
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800 leading-tight">
              {answer || "No answer provided"}
            </p>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pt-2 animate-pulse">
              Tap to flip back
            </p>
          </div>
        ) : (
          <div className="space-y-8 w-full animate-in zoom-in-95 duration-500">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
              {question || "No question available"}
            </p>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pt-2">
              Tap to reveal answer
            </p>
            {/* {isRepeat && (
              <Badge
                variant="secondary"
                className="bg-violet-50 text-violet-700 border border-violet-200 px-4 py-1.5 rounded-full flex gap-2 items-center shadow-sm text-[11px] uppercase font-extrabold tracking-wider mx-auto w-fit"
              >
                <BrainCircuit className="w-4 h-4" />
                Recommended Repeat
              </Badge>
            )} */}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {(accuracy !== 0 && isBack) || (!isBack && isRepeat) ? (
        <CardFooter className="flex items-center justify-between py-3 px-6 border-t">
          {!isBack && isRepeat && (
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 uppercase text-[10px] font-bold"
            >
              <BrainCircuit className="w-4 h-4" />
              Repeat
            </Badge>
          )}
          {accuracy !== 0 && isBack && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full ml-auto",
                accuracy >= 80 && "bg-green-50 text-green-700 border-green-200",
                accuracy >= 50 && accuracy < 80 && "bg-yellow-50 text-yellow-700 border-yellow-200",
                accuracy < 50 && "bg-red-50 text-red-700 border-red-200",
              )}
            >
              {accuracy}% Accuracy
            </Badge>
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
}