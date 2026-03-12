import { prisma } from "@/lib/prisma";
import { logger } from "../logger";

/* ---------------- USERS ---------------- */

export async function fetchUserById(userId: number) {
  try {
    const user = await prisma.user.findUnique({
       where: { id: userId },
    });
    return user;
  } catch (error) {
    logger.error(`Failed to fetch user by Id: ${error}`);
    throw new Error("Failed to fetch user.");
  }
}

export async function fetchUsers(schoolId:number) {
  try {
    const users = await prisma.user.findMany({
      where: {
        school_id: schoolId,
      },
    });
    return users;
  } catch (error) {
    logger.error(`Failed to fetch users: ${error}`);
    throw new Error("Failed to fetch users.");
  }
}

/* ---------------- SCHOOL ---------------- */

export async function fetchSchool(schoolId: number) {
  try {
    const school = await prisma.school.findFirst({
      where: { id: schoolId },
    });
    return school;
  } catch (error) {
    logger.error(`Failed to fetch school: ${error}`);
    throw new Error("Failed to fetch school.");
  }
}

/* ---------------- SCHOOL CLASS SUBJECTS ---------------- */

export async function fetchSchoolClassSubjects(schoolId: number) {
  try {
    const schoolClassSubjects = await prisma.schoolClassSubject.findMany({
      where: { school_id: schoolId },
      include: {
        class_subject: true,
      },
    });
    return schoolClassSubjects;
  } catch (error) {
    logger.error(`Failed to fetch School Class Subjects: ${error}`);
    throw new Error("Failed to fetch School Class Subjects");
  }
}

/* ---------------- CLASSES ---------------- */

export async function fetchClasses() {
  try {
    const classes = await prisma.class.findMany({ orderBy: { id: "asc" } });
    return classes;
  } catch (error) {
    logger.error(`Failed to fetch Classes: ${error}`);
    throw new Error("Failed to fetch Classes");
  }
}

/* ----------------  SUBJECTS ---------------- */

export async function fetchSubjects() {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { id: "asc" } });
    return subjects;
  } catch (error) {
    logger.error(`Failed to fetch Subjects: ${error}`);
    throw new Error("Failed to fetch Subjects");
  }
}

/* ---------------- USER CLASS SUBJECTS ---------------- */

export async function fetchUserClassSubjects(userId: number) {
  try {
    const userClassSubjects = await prisma.userClassSubject.findMany({
      where: {
        user_id: userId
      },
    });
    return userClassSubjects;
  } catch (error) {
    logger.error(`Failed to fetch user class subjects: ${error}`);
    throw new Error("Failed to fetch user class subjects.");
  }
}