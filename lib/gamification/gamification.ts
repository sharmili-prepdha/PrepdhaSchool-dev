import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { applyStreakUpdate, toGMTDateOnly } from "@/lib/gamification/streak";
import { getCachedXpRules } from "@/lib/gamification/xpRules";

// Types & constants

export const gamificationActivityTypes = [
  "LOGIN",
  "REVISION_COMPLETE",
  "NEW_TOPIC_COMPLETE",
  "ANSWER_CORRECT",
  "ANSWER_WRONG",
  "DID_FLASHCARDS",
] as const;

export type GamificationActivityType = (typeof gamificationActivityTypes)[number];

type GamificationContext = { userId: number };

type GamificationState = {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
};

type StudentGamificationState = {
  studentId: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
};

// Main handler: single entry point for all gamification events

export async function triggerGamificationEvent(
  activityType: GamificationActivityType,
  context?: GamificationContext,
): Promise<StudentGamificationState | null> {
  let userIdForTx: number;

  if (context) {
    userIdForTx = context.userId;
  } else {
    const session = await getAuthUser();
    if (!session) return null;
    if (session.role !== "student") return null;

    userIdForTx = session.userId;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const now = new Date();
      const xpRules = await getCachedXpRules();

      const existing = await tx.studentGamificationState.findUnique({
         where: { student_id: userIdForTx },
      });

      const initialState: GamificationState = {
        totalXp: existing?.total_xp ?? 0,
        currentStreak: existing?.current_streak ?? 0,
        longestStreak: existing?.longest_streak ?? 0,
        lastActiveDate: existing?.last_active_date ?? null,
      };

      let newState: GamificationState;
      logger.info(`activityType triggerGamificationEvent ${activityType}`);

      switch (activityType) {
        case "LOGIN":
          newState = applyLoginLogic(initialState, xpRules, now);
          break;
        case "REVISION_COMPLETE":
        case "NEW_TOPIC_COMPLETE":
        case "ANSWER_CORRECT":
        case "ANSWER_WRONG":
        case "DID_FLASHCARDS":
          newState = initialState;
          break;
        default:
          logger.warn(`Unknown activity type: ${activityType}`);
          newState = initialState;
      }

      return tx.studentGamificationState.upsert({
                 where: { 
                  student_id: userIdForTx
                 },
        create: {
          student_id: userIdForTx,
          total_xp: newState.totalXp,
          current_streak: newState.currentStreak,
          longest_streak: newState.longestStreak,
          last_active_date: newState.lastActiveDate ?? now,
        },
        update: {
          total_xp: newState.totalXp,
          current_streak: newState.currentStreak,
          longest_streak: newState.longestStreak,
          last_active_date: newState.lastActiveDate ?? now,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return {
    studentId: result.student_id,
    totalXp: result.total_xp,
    currentStreak: result.current_streak,
    longestStreak: result.longest_streak,
    lastActiveDate: result.last_active_date,
  };
}

function applyLoginLogic(
  state: GamificationState,
  xpRules: Record<string, number>,
  now: Date,
): GamificationState {
  const today = toGMTDateOnly(now);

  let { totalXp, currentStreak, longestStreak, lastActiveDate } = state;

  let shouldAwardLoginXp = true;

  if (lastActiveDate) {
    const last = toGMTDateOnly(lastActiveDate);
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      shouldAwardLoginXp = false;
      logger.info("Login already completed today, skipping XP");
    } else if (diffDays >= 7) {
      const penaltyXp = xpRules["LOGIN_MISSED_7DAYS"] ?? -50;
      totalXp = Math.max(0, totalXp + penaltyXp);
      currentStreak = 0;
      logger.info(`7+ days gap (${diffDays}). Penalty applied: ${penaltyXp}`);
    } else if (diffDays > 1) {
      currentStreak = 0;
      logger.info(`${diffDays} day gap. Streak reset.`);
    }
  }

  if (shouldAwardLoginXp) {
    totalXp += xpRules["LOGIN"] ?? 0;

    const streakResult = applyStreakUpdate(currentStreak, lastActiveDate, now);
    currentStreak = streakResult.currentStreak;
    lastActiveDate = streakResult.lastActiveDate;

    if (currentStreak === 3) {
      const bonusXp = xpRules["LOGIN_STREAK_3D"] ?? 10;
      totalXp += bonusXp;
      logger.info(`3-day streak bonus: +${bonusXp} XP`);
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { totalXp, currentStreak, longestStreak, lastActiveDate };
}