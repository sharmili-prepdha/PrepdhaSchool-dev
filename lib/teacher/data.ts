import { prisma } from "@/lib/prisma";

export async function getStudentsStats({
  studentIds,
  csIds,
  totalPagesCount
}: {
  studentIds: number[];
  csIds: number[];
  totalPagesCount: number;
}) {
  if (studentIds.length === 0 || csIds.length === 0) {
    return { accMap: new Map<number, number>(), progMap: new Map<number, number>() };
  }

  const [topicProgressMap, pageProgressMap] = await Promise.all([
    prisma.studentTopicProgress.groupBy({
      by: ["student_id"],
      where: { 
        student_id: { in: studentIds }, 
        class_subject_id: { in: csIds } 
      },
      _avg: { accuracy: true }
    }),
    prisma.studentPageProgress.groupBy({
      by: ["student_id"],
      where: { 
        student_id: { in: studentIds }, 
        class_subject_id: { in: csIds }, 
        is_completed: true 
      },
      _count: { page_id: true }
    })
  ]);

  const accMap = new Map(topicProgressMap.map(t => [t.student_id, Number(t._avg?.accuracy) || 0]));
  const progMap = new Map(pageProgressMap.map(p => [
    p.student_id, 
    (p._count?.page_id / Math.max(1, totalPagesCount)) * 100 
  ]));

  return { accMap, progMap };
}

export async function getStudentsAccuracy({
  studentIds,
  csIds
}: {
  studentIds: number[];
  csIds: number[];
}) {
  if (studentIds.length === 0 || csIds.length === 0) {
    return new Map<number, number>();
  }

  const topicProgressAll = await prisma.studentTopicProgress.groupBy({
    by: ["student_id"],
    where: {
      student_id: { in: studentIds },
      class_subject_id: { in: csIds }
    },
    _avg: { accuracy: true }
  });

  return new Map(topicProgressAll.map(t => [t.student_id, Number(t._avg?.accuracy) || 0]));
}

export async function getOverallMetrics({
  studentIds,
  csIds,
  totalPagesCount
}: {
  studentIds: number[];
  csIds: number[];
  totalPagesCount: number;
}) {
  if (studentIds.length === 0 || csIds.length === 0 || totalPagesCount === 0) {
    return { avgAccuracy: 0, totalProgress: 0 };
  }

  const [accQuery, completedPages] = await Promise.all([
    prisma.studentTopicProgress.aggregate({
      where: {
        student_id: { in: studentIds },
        class_subject_id: { in: csIds },
      },
      _avg: { accuracy: true }
    }),
    prisma.studentPageProgress.count({
      where: {
        student_id: { in: studentIds },
        class_subject_id: { in: csIds },
        is_completed: true
      }
    })
  ]);

  const totalPossiblePages = studentIds.length * totalPagesCount;
  const avgAccuracy = accQuery?._avg?.accuracy ? Number(accQuery._avg.accuracy) : 0;
  const totalProgress = totalPossiblePages > 0 ? (completedPages / totalPossiblePages) * 100 : 0;

  return { avgAccuracy, totalProgress };
}
