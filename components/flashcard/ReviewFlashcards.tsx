"use client";

import { useEffect, useRef, useState } from "react";
import { Flashcard, ReviewQuality } from "@/app/generated/prisma/client";
import { ReviewButtons } from "@/components/flashcard/ReviewButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NextCard } from "@/app/api/flashcard/type";
import { FlashcardScheduler } from "@/features/flashcard/service/flashcard";
import FlashcardContainer from "./card/FlashcardContainer";
import { createSessionCompleteCard } from "@/lib/srs";
import { SESSION_COMPLETE_ID } from "@/features/flashcard/service/types";

const CARD_COLOR_MAP = {
  again: "!border-red-500 !bg-red-50",
  hard: "!border-yellow-500 !bg-yellow-50",
  good: "!border-green-500 !bg-green-50",
  easy: "!border-violet-500 !bg-violet-50",
};

const HEADER_ACCENT_MAP: Record<keyof typeof CARD_COLOR_MAP, string> = {
  again: "bg-red-600 text-white border-red-200",
  hard: "bg-yellow-600 text-white border-yellow-200",
  good: "bg-green-600 text-white border-green-200",
  easy: "bg-violet-600 text-white border-violet-200",
};

export function ReviewFlashcards() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Scheduler state
  const [cards, setCards] = useState<NextCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [totalSessionCards, setTotalSessionCards] = useState(0);
  const [ratings, setRatings] = useState<Record<number, ReviewQuality>>({});
  const schedulerRef = useRef<FlashcardScheduler | null>(null);
  const currentCard = cards[currentCardIndex];

  useEffect(() => {
    async function initializeScheduler() {
      const schedulerObj = new FlashcardScheduler();
      await schedulerObj.init();
      setTotalSessionCards(schedulerObj.getTotalCardsLength());
      const nextCard = await schedulerObj.getNextCard();
      setCards([...(nextCard ? [nextCard] : [])]);
      schedulerRef.current = schedulerObj;
    }

    initializeScheduler();
  }, []);

  useEffect(() => {
    const ensureCardAvailable = async () => {
      if (cards.length === 0) {
        const next = await schedulerRef.current?.getNextCard();

        if (next) {
          setCards([next]);
          setCurrentCardIndex(0);
        }
      }
    };

    ensureCardAvailable();
  }, [cards.length]);

  const getCardColorClass = () => {
    const card = cards[currentCardIndex];
    if (!card) return "";

    // Additional check: if already reviewed with same rating, prevent re-submission
    const cardId = card.flashcard.id;
    const rating = ratings[cardId];

    if (!rating) {
      return ""; // default style
    }

    return CARD_COLOR_MAP[rating as keyof typeof CARD_COLOR_MAP] || "";
  };

  const getHeaderAccentClass = () => {
    const card = cards[currentCardIndex];
    if (!card) return "";
    const rating = ratings[card.flashcard.id];
    if (!rating) return "";
    return HEADER_ACCENT_MAP[rating as keyof typeof HEADER_ACCENT_MAP] || "";
  };

  const handleReview = async (rating: ReviewQuality) => {
    const card = cards[currentCardIndex];
    if (!card) return;

    // Additional check: if already reviewed with same rating, prevent re-submission
    const cardId = card.flashcard.id;

    if (isProcessing) return;

    // Prevent duplicate DB call
    if (ratings[cardId] === rating) return;

    setIsProcessing(true);

    try {
      await schedulerRef.current?.processAnswer(card, rating);
      setRatings((prev) => ({
        ...prev,
        [cardId]: rating,
      }));
    } finally {
      setIsProcessing(false);
      handleRevealAnswer();
    }
  };

  const handlePrevious = () => {
    if (isEditing) return;
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex === 0) return 0; // stop at first card
      return prevIndex - 1;
    });

    setShowAnswer(false);
  };

  const handleNext = async () => {
    if (isEditing) return;
    if (isProcessing) return;

    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    const cardId = currentCard.flashcard.id;
    // Block if no rating selected
    if (!ratings[cardId]) return;

    // If next already exists in array → just move forward
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
      setShowAnswer(false);
      return;
    }
    setIsProcessing(true);
    try {
      const nextCard = await schedulerRef.current?.getNextCard();

      if (!nextCard) {
        setCards((prev) => {
          const updated = [...prev, createSessionCompleteCard()];
          setCurrentCardIndex(updated.length - 1);
          return updated;
        });
        return;
      }

      setCards((prev) => {
        const filtered = prev.filter((c) => c.flashcard?.id !== nextCard.flashcard?.id);
        const updated = [...filtered, nextCard];
        // Update index based on new array
        setCurrentCardIndex(updated.length - 1);
        return updated;
      });

      // To reset the color code for the ui as it will repeat the quetion at certain interval
      setRatings((prev) => {
        const copy = { ...prev };
        delete copy[nextCard.flashcard.id];
        return copy;
      });
      setShowAnswer(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevealAnswer = () => setShowAnswer(true);

  const handleEdit = (updatedCard: Flashcard) => {
    // Update UI session state
    setCards((prev) =>
      prev.map((c) => (c.flashcard.id === updatedCard.id ? { ...c, flashcard: updatedCard } : c)),
    );

    // Update scheduler queues
    schedulerRef.current?.updateCard(updatedCard);
  };

  const handleDelete = (cardId: number) => {
    // Remove from React state
    setCards((prev) => {
      const updated = prev.filter((c) => c.flashcard.id !== cardId);
      setCurrentCardIndex((index) => {
        if (index >= updated.length) {
          return updated.length - 1;
        }
        return index;
      });

      return updated;
    });

    // Remove rating
    setRatings((prev) => {
      const copy = { ...prev };
      delete copy[cardId];
      return copy;
    });

    schedulerRef.current?.removeCard(cardId); // Remove from scheduler queues
    setTotalSessionCards(schedulerRef.current?.getTotalCardsLength() ?? 0);
  };

  const handleAccuracy = () => {
    const lapses = currentCard?.reviewState?.lapses ?? 0;
    const repetition = currentCard?.reviewState?.repetition ?? 0;
    return repetition === 0 ? 0 : Math.round((((repetition - lapses) / repetition) * 10000) / 100);
  };

  return (
    <div className="w-full h-full bg-background flex items-center justify-center p-6">
      {/* Grid: [chevron] [card / buttons] [chevron] */}
      <div className="grid gap-x-4 gap-y-6" style={{ gridTemplateColumns: "auto 1fr auto" }}>
        {/* Left chevron — row 1, col 1 — aligned with card only */}
        <div className="flex items-center row-start-1 col-start-1">
          <Button
            variant="elevated"
            size="icon"
            className="border-b-2 border-gray-500"
            onClick={handlePrevious}
            disabled={isEditing || isProcessing || currentCardIndex === 0}
          >
            <ChevronLeft />
          </Button>
        </div>

        {/* Card — row 1, col 2 */}
        <div className="row-start-1 col-start-2">
          <FlashcardContainer
            key={currentCard?.flashcard?.id}
            currentCard={currentCard?.flashcard}
            currentCardIndex={currentCardIndex}
            flashcardLength={totalSessionCards}
            isEditing={isEditing}
            showAnswer={showAnswer}
            onReveal={() => setShowAnswer(true)}
            onFlipBack={() => setShowAnswer(false)}
            onEditCancel={() => setIsEditing(false)}
            onEditActive={() => setIsEditing(true)}
            onDelete={() => handleDelete(currentCard?.flashcard?.id)}
            cardClassName={getCardColorClass()}
            headerAccentClassName={getHeaderAccentClass()}
            onEdit={handleEdit}
            handleAccuracy={handleAccuracy}
            isRepeat={currentCard?.isRepeat}
          />
        </div>

        {/* Right chevron — row 1, col 3 — aligned with card only */}
        <div className="flex items-center row-start-1 col-start-3">
          <Button
            variant="elevated"
            size="icon"
            className="border-b-2 border-gray-500"
            onClick={handleNext}
            disabled={
              isProcessing ||
              !currentCard ||
              !ratings[currentCard.flashcard.id] ||
              currentCard.flashcard.id === SESSION_COMPLETE_ID
            }
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Review buttons — row 2, col 2 — same column = same width as card */}
        <div className="row-start-2 col-start-2">
          <ReviewButtons
            onSelect={handleReview}
            disabled={isProcessing || currentCard?.flashcard.id === SESSION_COMPLETE_ID}
            currentInterval={currentCard?.reviewState?.interval_factor ?? 1}
          />
        </div>
      </div>
    </div>
  );
}
