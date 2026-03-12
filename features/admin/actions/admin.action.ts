"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/app/generated/prisma/enums";
import { hashPassword } from "@/lib/password";
import { logger } from "@/lib/logger";

/* =========================================================
   UPDATE USER SUBJECTS
========================================================= */

export async function updateUserSubjects(
  userId: number,
  schoolId: number,
  classSubjectIds: number[],
) {
  try {
    await prisma.$transaction([
      prisma.userClassSubject.deleteMany({
        where: {
          user_id: userId,
        },
      }),
      ...(classSubjectIds.length > 0
        ? [
            prisma.userClassSubject.createMany({
              data: classSubjectIds.map((id) => ({
                user_id: userId,
                class_subject_id: id,
              })),
            }),
          ]
        : []),
    ]);

    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to update subjects: ${error}`);
    return { success: false };
  }
}

/* =========================================================
   CREATE USER (UPDATED - NO MANUAL ID)
========================================================= */

export type CreateUserState = {
  success: boolean;
  message: string;
  error: string;
  newId?: number;
  name?: string;
  role?: string;
  password?: string;
  loginId?: string;
};

function generateRandom8DigitNumber(): string {
  const min = 10000000;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1)) + min + "";
}

export async function createUser(
  schoolId: number,
  prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  try {
    const name = formData.get("name")?.toString().trim();
    const roleValue = formData.get("role")?.toString();
    let loginId = formData.get("loginId")?.toString().trim().toLowerCase();;

    logger.info(`name ${name}, role ${roleValue}, school ${schoolId}`);

    if (!name || !roleValue || !schoolId) {
      return {
        success: false,
        message: "",
        error: "Missing required fields",
      };
    }

    if (!Object.values(Role).includes(roleValue as Role)) {
      return {
        success: false,
        message: "",
        error: "Invalid role selected",
      };
    }

    if (!Number.isInteger(schoolId)) {
      return {
        success: false,
        message: "",
        error: "Invalid school ID",
      };
    }

    // Validate loginId if provided
    if (loginId && !/^[a-z0-9_-]+$/.test(loginId)) {
      return {
        success: false,
        message: "",
        error: "Login ID must be alphanumeric",
      };
    }

    const password = generateRandom8DigitNumber();
    logger.info(`password : ${password}`);

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {

      // If loginId provided → check duplicate
      if (loginId) {
        const existing = await tx.user.findFirst({
          where: {
            school_id: schoolId,
            login_id: loginId,
          },
        });

        if (existing) {
          throw new Error("Login ID already exists");
        }
      }

      // Generate loginId if not provided
      if (!loginId) {
        const school = await tx.school.update({
          where: { id: schoolId },
          data: {
            user_counter: { increment: 1 },
          },
          select: {
            user_counter: true,
            keyword: true,
          },
        });

        const counter = school.user_counter;
        loginId = `${String(counter).padStart(5, "0")}`;
      }

      const user = await tx.user.create({
        data: {
          school_id: schoolId,
          login_id: loginId!,
          name,
          role: roleValue as Role,
          password_hash: passwordHash,
        },
        select: {
          id: true,
          name: true,
          role: true,
          login_id: true,
        },
      });

      return user;
    });

    logger.info(`User created successfully: ${user.id}`);

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User created successfully",
      error: "",
      newId: user.id,
      name: user.name,
      role: user.role,
      loginId: user.login_id,
      password,
    };

  } catch (error) {
    logger.error(`Failed to create user: ${error}`);

    if (error instanceof Error && error.message === "Login ID already exists") {
      return {
        success: false,
        message: "",
        error: "Login ID already exists",
      };
    }

    return {
      success: false,
      message: "",
      error: "Failed to create user",
    };
  }
}

/* =========================================================
   UPDATE USER
========================================================= */

type UpdateUserState = {
  success: boolean;
  error: string;
};

export async function updateUser(
  prevState: UpdateUserState,
  formData: FormData,
): Promise<UpdateUserState> {
  try {
    const idStr = formData.get("id")?.toString();
    const schoolIdStr = formData.get("schoolId")?.toString();
    const name = formData.get("name")?.toString().trim();
    const roleValue = formData.get("role")?.toString();

    if (!idStr || !schoolIdStr || !name || !roleValue) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    if (!Object.values(Role).includes(roleValue as Role)) {
      return {
        success: false,
        error: "Invalid role selected",
      };
    }

    const id = Number(idStr);
    const schoolId = Number(schoolIdStr);

    if (!Number.isInteger(id) || !Number.isInteger(schoolId)) {
      return {
        success: false,
        error: "Invalid user or school ID",
      };
    }

    await prisma.user.update({
       where: { id: id },
      data: {
        name,
        role: roleValue as Role,
      },
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      error: "",
    };
  } catch (error) {
    logger.error(`Failed to update user: ${error}`);

    return {
      success: false,
      error: "Failed to update user",
    };
  }
}

/* =========================================================
   DELETE USER
========================================================= */

export async function deleteUser(userId: number) {
  try {
    await prisma.user.delete({
       where: { id: userId },
    });

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    logger.error(`Failed to delete user: ${error}`);
    return { success: false, error: "Failed to delete user" };
  }
}
