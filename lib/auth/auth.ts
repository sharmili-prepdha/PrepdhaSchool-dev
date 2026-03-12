import { auth } from "@/auth";
import type { Role } from "@/app/generated/prisma/enums";

export type AuthUser = {
  userId: number;
  schoolId: number;
  role: Role;
  mustChangePassword: boolean;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const u = session.user as {
    userId?: number;
    schoolId?: number;
    role?: Role;
    mustChangePassword?: boolean;
  };
  if (
    typeof u.userId !== "number" ||
    typeof u.schoolId !== "number" ||
    !u.role
  ) {
    return null;
  }

  return {
    userId: u.userId,
    schoolId: u.schoolId,
    role: u.role,
    mustChangePassword: Boolean(u.mustChangePassword),
  };
}