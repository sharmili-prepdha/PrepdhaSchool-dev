"use server";

import { getAuthUser } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

import { AnswerContent, QuestionContent } from "../types/flashcard";

export interface SaveEditFlashcardInput {
  flashcardId: number;
  question: QuestionContent;
  answer: AnswerContent;
}

export interface SaveEditFlashcardResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

export async function updateFlashcard(
  id: number,
  data: {
    question: QuestionContent;
    answer: AnswerContent;
  },
) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return {
        success: false,
        message: "User not found",
        error: "User does not exist in the specified school",
      };
    }

    // Update flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
      },
    });

    return {
      success: true,
      message: "Flashcard updated successfully",
      data: updatedFlashcard,
    };
  } catch (error) {
    logger.error(`Error in handleSaveEdit: ${error}`);
    return {
      success: false,
      message: "Failed to update flashcard",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteFlashcardAction(flashcardId: number) {
  if (!flashcardId) {
    throw new Error("Flashcard ID is required");
  }

  await prisma.flashcard.delete({
    where: {
      id: flashcardId,
    },
  });

  return { success: true };
}
