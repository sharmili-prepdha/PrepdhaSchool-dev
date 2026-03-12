import { getAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ReviewQuality } from "@/app/generated/prisma/enums";

const INTERVAL_LADDER = [
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
];

const ratingToIntervalMap: Record<ReviewQuality, number> = {
  again: -Infinity,
  hard: -1,
  good: 1,
  easy: 2,
};

// Define the request schema
const ReviewRequestSchema = z.object({
  flashcardId: z.number().int().positive(),
  rating: z.nativeEnum(ReviewQuality),
  currentInterval: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { flashcardId, rating } = ReviewRequestSchema.parse(body);

    if (!flashcardId || !rating) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const existingState = await prisma.studentFlashcardState.findFirst({
      where: {
        flashcard_id: flashcardId,
        student_id: user.userId,
      },
    });

    const currentInterval = existingState?.interval_factor ?? 0;

    const { newInterval, nextReviewAt } = calculateNextReview(currentInterval, rating);

    const updatedRepetition = (existingState?.repetition ?? 0) + 1;

    const updatedLapses = ["hard", "again"].includes(rating)
      ? (existingState?.lapses ?? 0) + 1
      : (existingState?.lapses ?? 0);

    const state = await prisma.studentFlashcardState.upsert({
      where: {
        student_id_flashcard_id: {
          student_id: user.userId,
          flashcard_id: flashcardId,
        },
      },
      update: {
        interval_factor: newInterval,
        next_review_at: nextReviewAt,
        repetition: updatedRepetition,
        lapses: updatedLapses,
        last_reviewed_at: new Date(),
        last_quality: rating,
      },
      create: {
        student_id: user.userId,
        flashcard_id: flashcardId,
        interval_factor: newInterval,
        next_review_at: nextReviewAt,
        repetition: 1,
        lapses: updatedLapses,
        last_quality: rating,
        created_at: new Date(),
      },
    });

    return NextResponse.json({
      data: state,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateNextReview(currentIntervalSeconds: number, rating: ReviewQuality) {
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
