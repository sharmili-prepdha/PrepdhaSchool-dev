import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import TeacherDashboard from "@/components/teacher/teacher-dashboard";
import { getStudentsStats, getOverallMetrics } from "@/lib/teacher/data";

export default async function SubjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.userId) redirect("/login");
  
  const { id } = await params;
  const subjectId = Number(id);

  const sp = await searchParams;
  const query = sp.q || "";
  const page = parseInt(sp.page || "1", 10);
  const sort = sp.sort || "name_asc";
  const take = 10;
  const skip = (page - 1) * take;

  const buildQueryString = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (sp.page) next.set("page", sp.page);
    if (sort) next.set("sort", sort);
    for (const [k, v] of Object.entries(updates)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `?${qs}` : "";
  };

  const subjectRecord = await prisma.subject.findUnique({
    where: { id: subjectId }
  });

  if (!subjectRecord) return <div>Subject not found</div>;

  const assignedClassSubjects = await prisma.userClassSubject.findMany({
    where: {
      user_id: session.user.userId,
      class_subject: { subject_id: subjectId }
    },
    select: { class_subject_id: true }
  });

  const csIds = assignedClassSubjects.map(acs => acs.class_subject_id);

  if (csIds.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-10 flex flex-col items-center justify-center min-h-[400px] text-center">
         <h1 className="text-2xl font-bold text-slate-900 mb-2">{subjectRecord.name} Overview</h1>
         <p className="text-slate-500">No classes assigned to you for this subject.</p>
      </div>
    );
  }

  const whereCondition: Prisma.UserWhereInput = {
    role: "student",
    school_id: session.user.schoolId,
    name: { contains: query, mode: "insensitive" },
    user_class_subject: { some: { class_subject_id: { in: csIds } } }
  };

  const [totalStudents, students, pageCount, allEnrolledStudents] = await Promise.all([
    prisma.user.count({ where: whereCondition }),
    prisma.user.findMany({
      where: whereCondition,
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    }),
    prisma.page.count({
      where: { topic: { chapter: { book: { class_subject_id: { in: csIds } } } } }
    }),
    prisma.user.findMany({
      where: {
        role: "student",
        school_id: session.user.schoolId,
        user_class_subject: { some: { class_subject_id: { in: csIds } } }
      },
      select: { id: true }
    })
  ]);

  const studentIds = students.map(s => s.id);
  const allStudentIds = allEnrolledStudents.map(s => s.id);

  const [{ accMap, progMap }, { avgAccuracy, totalProgress }] = await Promise.all([
    getStudentsStats({ studentIds, csIds, totalPagesCount: pageCount }),
    getOverallMetrics({ studentIds: allStudentIds, csIds, totalPagesCount: pageCount })
  ]);

  const studentStats = students.map(student => ({
    ...student,
    accuracy: accMap.get(student.id) || 0,
    progress: progMap.get(student.id) || 0
  })).sort((a, b) => {
    switch (sort) {
      case "accuracy_asc": return a.accuracy - b.accuracy || a.name.localeCompare(b.name);
      case "accuracy_desc": return b.accuracy - a.accuracy || a.name.localeCompare(b.name);
      case "progress_asc": return a.progress - b.progress || a.name.localeCompare(b.name);
      case "progress_desc": return b.progress - a.progress || a.name.localeCompare(b.name);
      case "name_desc": return b.name.localeCompare(a.name);
      default: return a.name.localeCompare(b.name);
    }
  });

  const studentsPage = studentStats.slice(skip, skip + take);

  return (
    <TeacherDashboard
      title={`${subjectRecord.name} Overview`}
      breadcrumbs={[{ label: subjectRecord.name }]}
      metrics={{
        avgAccuracy,
        totalProgress,
        accuracyLabel: "Overall Subject Accuracy",
        progressLabel: "Overall Subject Progress",
      }}
      table={{
        title: `Enrolled Students in ${subjectRecord.name}`,
        students: studentsPage,
        totalStudents,
        searchQuery: query,
        progressLabel: "Subject Progress",
        reportBasePath: `/teacher/subject-overview/${subjectId}/student`,
        sort,
        buildQueryString,
      }}
    />
  );
}
