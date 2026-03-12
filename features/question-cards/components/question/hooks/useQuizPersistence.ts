import { logger } from "@/lib/logger";
import { useCallback } from "react";

interface AnswerState {
  selectedIds: string[];
  isCorrect: boolean;
  submitted: boolean;
}

interface QuizSnapshot {
  topicId: number;
  currentIndex: number;
  answers: Record<string, AnswerState>;
  questionIds: string[]; // Track question order to prevent issues on reshuffle
  savedAt: number; // timestamp
}

const STORAGE_KEY = (topicId: number) => `quiz_progress_${topicId}`;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useQuizPersistence(topicId: number) {
  // Save progress to localStorage
  const saveProgress = useCallback(
    (
      currentIndex: number,
      answers: Record<string, AnswerState>,
      questionIds: string[],
    ) => {
      const snapshot: QuizSnapshot = {
        topicId,
        currentIndex,
        answers,
        questionIds, // Save question order to prevent issues on reshuffle
        savedAt: Date.now(),
      };
      try {
        const serialized = JSON.stringify(snapshot);
        localStorage.setItem(STORAGE_KEY(topicId), serialized);
        // Verify the save was successful by attempting to read it back
        const verify = localStorage.getItem(STORAGE_KEY(topicId));
        if (!verify) {
          logger.warn(
            "Quiz progress save verification failed - data may be lost on refresh",
          );
        }
      } catch (e) {
        logger.warn({e},"Failed to persist quiz progress:");
      }
    },
    [topicId],
  );

  // Restore progress from localStorage
  const restoreProgress = useCallback((): QuizSnapshot | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(topicId));
      if (!raw) return null;

      const snapshot: QuizSnapshot = JSON.parse(raw);

      // Verify snapshot has required fields
      if (
        !snapshot.answers ||
        snapshot.currentIndex === undefined ||
        !snapshot.questionIds
      ) {
        logger.warn("Invalid snapshot - missing required fields");
        localStorage.removeItem(STORAGE_KEY(topicId));
        return null;
      }

      // Discard stale snapshots
      if (Date.now() - snapshot.savedAt > EXPIRY_MS) {
        logger.warn("Quiz snapshot expired");
        localStorage.removeItem(STORAGE_KEY(topicId));
        return null;
      }

      return snapshot;
    } catch (e) {
      logger.warn(`Failed to restore quiz progress:${e}`);
      // Clean up corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY(topicId));
      } catch {}
      return null;
    }
  }, [topicId]);

  // Clear after successful submission
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY(topicId));
  }, [topicId]);

  return { saveProgress, restoreProgress, clearProgress };
}
