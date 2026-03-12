import { NextCard } from "@/app/api/flashcard/type";
import { ReviewQuality } from "@/app/generated/prisma/enums";
import {
  INTERVAL_LADDER,
  ratingToIntervalMap,
  SESSION_COMPLETE_ID,
} from "@/features/flashcard/service/types";

export const formatInterval = (milliseconds: number): string => {
  if (!milliseconds) return "0s";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days} day`;
  if (hours > 0) return `${hours} hour`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds} s`;
};

export function calculateNextIntervalByRating(
  currentIntervalSeconds: number,
  rating: ReviewQuality,
): { newInterval: number; nextReviewAt: Date } {
  let level = findNearestLevel(currentIntervalSeconds);

  if (ratingToIntervalMap[rating] !== undefined) {
    level += ratingToIntervalMap[rating];
  }

  level = Math.max(0, Math.min(level, INTERVAL_LADDER.length - 1));

  const newInterval = INTERVAL_LADDER[level];

  return {
    newInterval,
    nextReviewAt: new Date(Date.now() + newInterval * 1000),
  };
}

function findNearestLevel(intervalSeconds: number) {
  const index = INTERVAL_LADDER.findIndex((i) => i >= intervalSeconds);
  return index === -1 ? INTERVAL_LADDER.length - 1 : index;
}

export function createSessionCompleteCard(): NextCard {
  return {
    flashcard: {
      id: SESSION_COMPLETE_ID,
      topic_id: 0,
      student_id: null,
      question: { text: "🎉 Session Complete" },
      answer: { correct: "No cards available to review." },
      scope: "global",
      create_at: new Date(),
      updated_at: new Date(),
    },
    reviewState: null,
  };
}
