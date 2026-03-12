"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/schoolManagement/imageConfig";
import { logger } from "@/lib/logger";
import { Role } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/password";

export async function updateSchoolAction(
  schoolId: number,
  prevState: { error: string },
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const keyword = formData.get("keyword") as string;
  const isActive = formData.get("is_active") === "true";
  const imageFile = formData.get("image_upload");

  const existingSchool = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!name) {
    return { error: "School name not entered" };
  }
  if (!keyword) {
    return { error: "Keyword not entered" };
  }

  if (!existingSchool) {
    return { error: "School not found" };
  }

  let logoDataUrl = existingSchool.logo_data_url;

  const isCleared = formData.get("image_upload_cleared") === "true";
  if (isCleared) {
    logoDataUrl = null;
  }
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      return { error: `Image must be less than ${MAX_IMAGE_SIZE_LABEL}` };
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    logoDataUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
  }

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      name,
      keyword,
      is_active: isActive,
      logo_data_url: logoDataUrl,
    },
  });

  revalidatePath("/superadmin/schoolManagement");
  redirect(`/superadmin/schoolManagement/${schoolId}`);
}

export async function updateSchoolClassSubjects(
  schoolId: number,
  classSubjectPairs: { class_id: number; subject_id: number }[],
) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing connections for this school
      await tx.schoolClassSubject.deleteMany({
        where: {
          school_id: schoolId,
        },
      });

      if (classSubjectPairs.length === 0) return;

      // 2. We need to ensure that every chosen pair actually exists in the `class_subjects` table.
      const existingClassSubjects = await tx.classSubject.findMany({
        where: {
          OR: classSubjectPairs.map((pair) => ({
            class_id: pair.class_id,
            subject_id: pair.subject_id,
          })),
        },
      });

      const existingSet = new Set(
        existingClassSubjects.map((cs) => `${cs.class_id}-${cs.subject_id}`),
      );

      const missingPairs = classSubjectPairs.filter(
        (pair) => !existingSet.has(`${pair.class_id}-${pair.subject_id}`),
      );

      if (missingPairs.length > 0) {
        await tx.classSubject.createMany({
          data: missingPairs.map((pair) => ({
            class_id: pair.class_id,
            subject_id: pair.subject_id,
          })),
          skipDuplicates: true,
        });
      }

      // 4. Look them all up again to get their actual IDs for the joining table
      const finalClassSubjects = await tx.classSubject.findMany({
        where: {
          OR: classSubjectPairs.map((pair) => ({
            class_id: pair.class_id,
            subject_id: pair.subject_id,
          })),
        },
      });

      // 5. Create new schoolClassSubjects relationships
      await tx.schoolClassSubject.createMany({
        data: finalClassSubjects.map((cs) => ({
          school_id: schoolId,
          class_subject_id: cs.id,
        })),
        skipDuplicates: true,
      });
    });

    revalidatePath(`/superadmin/schoolManagement/${schoolId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to update school class subjects: ${error}`);
    return { success: false, error: "Failed to update school subjects" };
  }
}

export async function checkKeywordAvailability(keyword: string, excludeId?: number) {
  if (!keyword || keyword.length < 3) return { exists: false };

  const school = await prisma.school.findFirst({
    where: {
      keyword,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return { exists: !!school };
}

export async function deleteSchool(formData: FormData) {
  const rawId = formData.get("id");
  if (!rawId) return;

  const id = Number(rawId);

  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool) return;

  await prisma.school.delete({
    where: { id },
  });

  revalidatePath("/superadmin/schoolManagement");
  redirect("/superadmin/schoolManagement");
}

function generateRandom8DigitNumber(): number {
  const min = 10000000;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createAdmin(
  schoolId: number,
  prevState: { success: boolean; error: string; userName: string; password: string; id: number },
  formData: FormData,
): Promise<{ success: boolean; error: string; userName: string; password: string; id: number; loginId: string; }> {
  try {
    const userName = (formData.get("user_name") as string)?.trim();

    if (!userName) {
      return { success: false, error: "Name is required.", userName: "", password: "", id: 0, loginId: "" };
    }

  return await prisma.$transaction(async (tx) => {

  const existingAdmin = await tx.user.findFirst({
    where: { school_id: schoolId, role: Role.admin }
  });

  if (existingAdmin) {
    return {
      success: false,
      error: "An admin already exists for this school.",
      userName: "",
      password: "",
      id: 0,
      loginId: ""
    };
  }

  const password = generateRandom8DigitNumber().toString();
  const passwordHash = await hashPassword(password);

  // increment school counter
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

  const loginId = `${school.user_counter.toString().padStart(5, "0")}`.toLowerCase();

  const user = await tx.user.create({
    data: {
      name: userName,
      email: userName,
      password_hash: passwordHash,
      school_id: schoolId,
      role: Role.admin,
      login_id: loginId,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    error: "",
    userName: userName,
    password,
    id: user.id,
    loginId: loginId
  };
});
  } catch (error) {
    logger.error(`Failed to create admin: ${error}`);
    return {
      success: false,
      error: "Failed to create admin. Please try again.",
      userName: "",
      password: "",
      id: 0,
      loginId: ""
    };
  }
}

export async function deleteAdmin(
  userId: number,
  schoolId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath(`/superadmin/schoolManagement/${schoolId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to delete admin: ${error}`);
    return { success: false, error: "Failed to delete admin." };
  }
}

export async function updateAdmin(
  userId: number,
  schoolId: number,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userName.trim()) {
      return { success: false, error: "Name is required." };
    }

    await prisma.user.update({
       where: { id: userId },
      data: { name: userName.trim() },
    });

    revalidatePath(`/superadmin/schoolManagement/${schoolId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to update admin: ${error}`);
    return { success: false, error: "Failed to update admin." };
  }
}
