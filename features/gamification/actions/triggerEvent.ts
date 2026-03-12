"use server";

import { getAuthUser } from "@/lib/auth/auth";
import {
  type GamificationActivityType,
  triggerGamificationEvent,
} from "@/lib/gamification/gamification";

export async function triggerGamificationEventAction(
  activityType: GamificationActivityType,
) {
  const session = await getAuthUser();
  if (!session || session.role !== "student") return null;
  return await triggerGamificationEvent(activityType, {
    userId: session.userId,
  });
}
