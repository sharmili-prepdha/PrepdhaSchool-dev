import { prisma } from "@/lib/prisma";
import { logger } from "../logger";

export async function fetchClasses() {
  try {
    const classesResult = await prisma.class.findMany();
    return classesResult;
  } catch (error) {
    logger.error(`Database Error: ${error}`);
    throw new Error("Failed to fetch Classes");
  }
}

export async function fetchSubjects() {
  try {
    const subjectsResult = await prisma.subject.findMany();
    return subjectsResult;
  } catch (error) {
    logger.error(`Database Error: ${error}`);
    throw new Error("Failed to fetch subjects.");
  }
}

export async function fetchClassSubjects() {
  try {
    const classSubjects = await prisma.classSubject.findMany();
    return classSubjects;
  } catch (error) {
    logger.error(`Database Error: ${error}`);
    throw new Error("Failed to fetch Class Subjects");
  }
}
