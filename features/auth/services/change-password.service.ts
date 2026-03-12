import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export type ChangePasswordSuccess = {
  success: true;
};

export type ChangePasswordFailure = {
  success: false;
  error: string;
};

export type ChangePasswordResult =
  | ChangePasswordSuccess
  | ChangePasswordFailure;

type ChangePasswordData = {
  password: string;
  email: string;
  mobile: string;
};

export async function changePasswordService(
  input: unknown,
  auth: { userId: number; schoolId: number },
): Promise<ChangePasswordResult> {
  try {
    const data = changePasswordSchema.parse(input) as ChangePasswordData;
    logger.info(`change password service data ${data}`);

    const hashed = await hashPassword(data.password);

    await prisma.user.update({
       where: { id: auth.userId },
      data: {
        password_hash: hashed,
        email: data.email,
        mobile: data.mobile,
        must_change_password: false,
      },
    });
    logger.info(
      `Password updated for user ${auth.userId} in school ${auth.schoolId}`,
    );

    return { success: true };
  } catch (err) {
    if (err instanceof ZodError) {
      logger.warn(
        `Change password validation error: ${err.issues[0]?.message}`,
      );
      return { success: false, error: err.issues[0]?.message };
    }
    logger.error(`Change password service error: ${err}`);
    return { success: false, error: "Password update failed" };
  }
}