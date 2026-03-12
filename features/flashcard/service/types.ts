import { Prisma } from "@/app/generated/prisma/client";
import { ReviewQuality } from "@/app/generated/prisma/enums";

export type FlashcardWithState = Prisma.FlashcardGetPayload<{
  include: {
    studentFlashcardState: {
      select: {
        currentIntervalFactor: true;
        nextReviewAt: true;
        repetition: true;
        lapses: true;
      };
    };
  };
}>;

export const INTERVAL_LADDER = [
  60,
  600,
  86400,
  86400 * 3,
  86400 * 7,
  86400 * 14,
  86400 * 30,
  86400 * 60,
  86400 * 120,
  86400 * 240,
] as const;

export const ratingToIntervalMap: Record<ReviewQuality, number> = {
  again: -Infinity,
  hard: -1,
  good: 1,
  easy: 2,
};


export const SESSION_COMPLETE_ID = -999;
