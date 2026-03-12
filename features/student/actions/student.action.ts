"use server";
import { prisma } from "@/lib/prisma";

export async function getStudentAccuracyAndProgress(studentId: number) {
  const [accuracy, progress] = await Promise.all([
    prisma.studentTopicProgress.aggregate({
      where: {
        student_id: studentId,
      },
      _avg: { accuracy: true },
    }),

    (async () => {
      const completed = await prisma.studentPageProgress.count({
        where: {
          student_id: studentId,
          is_completed: true,
        },
      });

      const total = await prisma.studentPageProgress.count({
        where: {
          student_id: studentId,
        },
      });

      return { completed, total };
    })(),
  ]);

  const avgAccuracy = accuracy._avg.accuracy ? Number(accuracy._avg.accuracy) : 0;

  return {
    overallAccuracy: Math.round(avgAccuracy),
    overallProgress:
      progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100),
  };
}
export async function getStudentXpAndStreak(studentId: number) {
  const gamificationState = await prisma.studentGamificationState.findUnique({
    where: {
      student_id: studentId,
    },
    select: {
      total_xp: true,
      current_streak: true,
      last_active_date: true,
    },
  });

  return {
    totalXp: gamificationState?.total_xp ?? 0,
    currentStreak: gamificationState?.current_streak ?? 0,
    lastActiveDate: gamificationState?.last_active_date ?? null,
  };
}

export async function getWeakTopics(studentId: number) {
  const lowestTopics = await prisma.studentTopicProgress.findMany({
    where: {
      student_id: studentId,
    },
    orderBy: {
      accuracy: "asc",
    },
    take: 3,
    include: {
      topic: true,
    },
  });

  return lowestTopics;
}

function getRevisionTopicsImpl(studentId: number) {
  return prisma.studentTopicRevision.findMany({
    where: {
      student_id: studentId,
      is_pending: true,
    },
    include: {
      topic: true,
    },
  });

}

export type RevisionTopic = Awaited<ReturnType<typeof getRevisionTopicsImpl>>[number];

export async function getRevisionTopics(studentId: number) {
  return await getRevisionTopicsImpl(studentId);
}

export async function getSubjectWiseAccuracyAndProgress(studentId: number) {
  const [subjects, topicProgress, completedPages, pages] = await Promise.all([
    // Subjects assigned to student
    prisma.userClassSubject.findMany({
      where: {
        user_id: studentId,
      },
      select: {
        class_subject_id: true,
        class_subject: {
          select: {
            subject: {
              select: { name: true },
            },
          },
        },
      },
    }),

    // Topic accuracy
    prisma.studentTopicProgress.findMany({
      where: {
        student_id: studentId,
      },
      select: {
        class_subject_id: true,
        accuracy: true,
      },
    }),

    // Completed pages
    prisma.studentPageProgress.findMany({
      where: {
        student_id: studentId,
        is_completed: true,
      },
      select: {
        class_subject_id: true,
      },
    }),

    // Total pages (via relation)
    prisma.page.findMany({
      select: {
        topic: {
          select: {
            chapter: {
              select: {
                book: {
                  select: {
                    class_subject_id: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  // ---------- Accuracy Map ----------
  const accuracyMap: Record<number, { total: number; count: number }> = {};

  topicProgress.forEach((row) => {
    const csId = row.class_subject_id;

    if (!accuracyMap[csId]) {
      accuracyMap[csId] = { total: 0, count: 0 };
    }

    const accuracy = row.accuracy === null || row.accuracy === undefined ? 0 : Number(row.accuracy);

    accuracyMap[csId].total += accuracy;
    accuracyMap[csId].count += 1;
  });

  // ---------- Completed Pages Map ----------
  const completedPagesMap: Record<number, number> = {};

  completedPages.forEach((row) => {
    const csId = row.class_subject_id;
    completedPagesMap[csId] = (completedPagesMap[csId] ?? 0) + 1;
  });

  // ---------- Total Pages Map ----------
  const totalPagesMap: Record<number, number> = {};

  pages.forEach((row) => {
    const csId = row.topic.chapter.book.class_subject_id;
    totalPagesMap[csId] = (totalPagesMap[csId] ?? 0) + 1;
  });

  // ---------- Final Result ----------
  const result = subjects.map((sub) => {
    const csId = sub.class_subject_id;

    const accuracyEntry = accuracyMap[csId];
    const totalPages = totalPagesMap[csId] ?? 0;
    const completed = completedPagesMap[csId] ?? 0;

    const accuracy =
      accuracyEntry && accuracyEntry.count > 0
        ? Math.round(accuracyEntry.total / accuracyEntry.count)
        : 0;

    const progress = totalPages === 0 ? 0 : Math.round((completed / totalPages) * 100);

    return {
      subject: sub.class_subject.subject.name,
      accuracy,
      progress,
    };
  });

  return result;
}
