"use server";

import { signIn } from "@/auth";
import { logger } from "@/lib/logger";
import { AuthError } from "next-auth";

type LoginState = {
  error: string;
};

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
   const schoolKeyword = formData.get("schoolKeyword")?.toString() ?? "";
  const loginId = formData.get("loginId")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!schoolKeyword || !loginId || !password) {
    return { error: "All fields are required" };
  }

  try {
    await signIn("credentials", {
      schoolKeyword,
      loginId,
      password,
      redirectTo: "/auth/redirect",
    });

    logger.info("Login successful without redirect (unexpected path)");
    return { error: "" };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    if (error instanceof AuthError) {
      logger.error(`Login failed: ${error.type} - ${error.message}`);

      if (error.type === "CredentialsSignin") {
        return { error: "Invalid school, user ID, or password" };
      }

      return { error: "Login failed. Please try again." };
    }

    logger.error(`Unexpected login error: ${error}`);
    throw error;
  }
}
