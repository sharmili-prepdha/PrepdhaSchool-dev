"use server";

import { auth, signOut } from "@/auth";
import { logger } from "@/lib/logger";
import { changePasswordService } from "../services/change-password.service";
import type { Role } from "@/app/generated/prisma/enums";

type ChangePasswordState = {
  error: string;
};

export async function changePasswordAction(
  prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();

  if (!session?.user) {
    logger.warn("Unauthorized password change attempt");
    return { error: "Unauthorized" };
  }

  const u = session.user as {
    userId?: number;
    schoolId?: number;
    role?: Role;
  };
  if (typeof u.userId !== "number" || typeof u.schoolId !== "number") {
    return { error: "Unauthorized" };
  }

  const result = await changePasswordService(Object.fromEntries(formData), {
    userId: u.userId,
    schoolId: u.schoolId,
  });

  if (!result.success) {
    return { error: result.error };
  }

  logger.info(
    `Password updated successfully for user ${u.userId} in school ${u.schoolId}`,
  );

  // Let Auth.js handle cookie clearing + redirect in a single response.
  await signOut({
    redirectTo: "/login?passwordChanged=1",
  });
  return { error: "" };
}