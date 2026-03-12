import { verifyPassword } from "@/lib/password";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Role } from "@/app/generated/prisma/enums";

export type LoginSuccess = {
  success: true;
  tokenPayload: {
    userId: number;
    schoolId: number;
    role: Role;
  };
  mustChangePassword: boolean;
};

export type LoginFailure = {
  success: false;
  error: string;
};

export type LoginResult = LoginSuccess | LoginFailure;

export async function loginService(input: unknown): Promise<LoginResult> {
  try {
    const data = loginSchema.parse(input);
    logger.info(`Login attempt for school keyword: ${data.schoolKeyword}`);

   const user = await prisma.user.findFirst({
      where: {
        login_id: data.loginId,
        school: {
          keyword: data.schoolKeyword,
        },
      },
      include: {
        school: true,
      },
    });

    if (!user || !user.is_active) {
      logger.warn(
        `Invalid login attempt for ${data.loginId} at school ${data.schoolKeyword}`
      );
      return { success: false, error: "Invalid credentials" };
    }

    // Check school active
    if (!user.school ||  !user.school.is_active) {
      logger.warn(`Inactive/In school login attempt: ${user.school.keyword}`);

      return {
        success: false,
        error: "School account is inactive/invalid. Please contact the school administrator.",
      };
    }

    const match = await verifyPassword(data.password, user.password_hash);

    if (!match) {
      logger.warn(`Invalid password for user ${user.login_id}`);
      return { success: false, error: "Invalid credentials" };
    }

    logger.info(`User ${user.id} authenticated successfully`);

    return {
      success: true,
      tokenPayload: {
        userId: user.id,
        schoolId: user.school.id,
        role: user.role,
      },
      mustChangePassword: user.must_change_password,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      logger.error(`Login validation error: ${err.issues[0]?.message}`);

      return {
        success: false,
        error: err.issues[0]?.message ?? "Invalid input",
      };
    }

    logger.error(`Login service error: ${err instanceof Error ? err.message : String(err)}`);

    return { success: false, error: "Invalid credentials" };
  }
}
