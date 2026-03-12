//GMT date-only and streak update helpers for gamification.
function toGMTDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

//Compute new streak and lastActiveDate from previous state.
//Same day = keep streak; +1 day = increment; gap = reset to 1.
export function applyStreakUpdate(
  existingStreak: number,
  lastActiveDate: Date | null,
  todayTimestamp: Date,
): { currentStreak: number; lastActiveDate: Date } {
  const today = toGMTDateOnly(todayTimestamp);
  if (!lastActiveDate) {
    return { currentStreak: 1, lastActiveDate: todayTimestamp };
  }
  const last = toGMTDateOnly(lastActiveDate);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { currentStreak: existingStreak, lastActiveDate: todayTimestamp };
  }
  if (diffDays === 1) {
    return {
      currentStreak: existingStreak + 1,
      lastActiveDate: todayTimestamp,
    };
  }
  return { currentStreak: 1, lastActiveDate: todayTimestamp };
}

export { toGMTDateOnly };
