"use server";

import { Role } from "@/app/generated/prisma/enums";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveQuizAccuracy({
  studentId,
  topicId,
  correctCount,
  totalCount,
}: {
  studentId: number;
  topicId: number;
  correctCount: number;
  totalCount: number;
}) {
  
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== Role.student) {
    throw new Error("Forbidden");
  }

  const accuracy =
    totalCount > 0
      ? parseFloat(((correctCount / totalCount) * 100).toFixed(2))
      : 0;

  // Convert to number types if needed
  const studentIdNum =
    typeof studentId === "string" ? parseInt(studentId, 10) : studentId;

  // Create timestamp
  const now = new Date();

  await prisma.studentTopicProgress.upsert({
    where: {
      student_id_topic_id: {
        student_id: studentIdNum,
        topic_id: topicId,
      },
    },
    update: {
      accuracy,
      last_activity_at: now,
    },
    create: {
      student_id: studentIdNum,
      topic_id: topicId,
      accuracy,
      last_activity_at: now,
      class_subject_id: 1 // HARDCODED: temporarily fixed for seeding; will be resolved dynamically in future
    },
  });

  return { success: true, accuracy };
}
