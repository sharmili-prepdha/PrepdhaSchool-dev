"use client";

import { useState, useTransition, useCallback } from "react";
import type { GamificationActivityType } from "@/lib/gamification/gamification";
import { triggerGamificationEventAction } from "@/features/gamification/actions/triggerEvent";

type UseGamificationEventState = {
  isPending: boolean;
  error: Error | null;
  lastState: {
    studentId: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date | null;
  } | null;
};

export function useGamificationEvent(): [
  (activityType: GamificationActivityType) => void,
  UseGamificationEventState,
] {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [lastState, setLastState] = useState<UseGamificationEventState["lastState"]>(null);

  const trigger = useCallback((activityType: GamificationActivityType) => {
    startTransition(async () => {
      setError(null);
      try {
        const updated = await triggerGamificationEventAction(activityType);
        if (updated) {
          setLastState(updated);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Failed to trigger gamification event"));
        }
      }
    });
  }, []);

  return [
    trigger,
    {
      isPending,
      error,
      lastState,
    },
  ];
}
