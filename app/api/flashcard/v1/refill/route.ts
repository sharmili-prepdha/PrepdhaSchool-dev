import { Flashcard } from "@/app/generated/prisma/client";
import { getAuthUser } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BATCH_LENGTH = 15;

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dueStates = await prisma.studentFlashcardState.findMany({
      where: {
        student_id: user.userId,
        next_review_at: { lte: new Date() },
      },
      orderBy: {
        next_review_at: "asc",
      },
      take: BATCH_LENGTH,
      include: {
        flashcard: true,
      },
    });

    const remaining = BATCH_LENGTH - dueStates.length;

    let newCards: Flashcard[] = [];
    if (remaining > 0) {
      newCards = await prisma.flashcard.findMany({
        where: {
          AND: [
            {
              // Card has NO state for this user
              studentFlashcardState: {
                none: {
                  student_id: user.userId,
                },
              },
            },
            {
              // Card visibility
              OR: [
                { student_id: null }, // global cards
                { student_id: user.userId }, // user-created cards
              ],
            },
          ],
        },
        take: remaining,
      });
    }

    const totalLength = await getTotalCount(user.userId);

    return NextResponse.json({
      data: [
        ...dueStates.map((d) => ({
          flashcard: d.flashcard,
          reviewState: d,
          type: "review",
        })),
        ...newCards.map((c) => ({
          flashcard: c,
          reviewState: null,
          type: "new",
        })),
      ],

      length: totalLength,
    });
  } catch (error) {
    logger.error({ error }, "Error in flashcard refill API");
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function getTotalCount(userId: number) {
  const [totalDue, totalNew] = await Promise.all([
    prisma.studentFlashcardState.count({
      where: {
        student_id: userId,
        next_review_at: { lte: new Date() },
      },
    }),

    prisma.flashcard.count({
      where: {
        AND: [
          {
            studentFlashcardState: {
              none: {
                student_id: userId,
              },
            },
          },
          {
            OR: [
              { student_id: null },
              { student_id: userId },
            ],
          },
        ],
      },
    }),
  ]);

  return totalDue + totalNew;
}
