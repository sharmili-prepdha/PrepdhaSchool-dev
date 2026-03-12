import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/auth";
import { ROLE_DEFAULT_PATH } from "@/lib/auth/route-config";
import { triggerGamificationEvent } from "@/lib/gamification/gamification";
import { logger } from "@/lib/logger";

export default async function AuthRedirectPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");

  // Trigger login gamification event (students only; pass user context to avoid second getAuthUser call)
  try {
    if (user.role === "student") {
      await triggerGamificationEvent("LOGIN", {
        userId: user.userId,
      });
      logger.info(`Login gamification event triggered for user ${user.userId}`);
    }
  } catch (err) {
    logger.error(
      `Failed to trigger login gamification event: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  redirect(ROLE_DEFAULT_PATH[user.role]);
}
