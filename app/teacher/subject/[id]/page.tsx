import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import TeacherDashboard from "@/components/teacher/teacher-dashboard";
import { getStudentsStats } from "@/lib/teacher/data";

export default async function SubjectStudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.userId) redirect("/login");
  
  const { id } = await params;
  const csId = Number(id);

  const sp = await searchParams;
  const query = sp.q || "";
  const page = parseInt(sp.page || "1", 10);
  const sort = sp.sort || "name_asc";
  const take = 10;
  const skip = (page - 1) * take;

  const csRecord = await prisma.classSubject.findUnique({
    where: { id: csId },
    include: {
      class: true,
      subject: true,
    }
  });

  if (!csRecord) return <div>Class Subject not found</div>;
  const { class: cls, subject: sub } = csRecord;

  const whereCondition: Prisma.UserWhereInput = {
    role: "student",
    school_id: session.user.schoolId,
    name: { contains: query, mode: "insensitive" },
    user_class_subject: { some: { class_subject_id: csId } }
  };

  const [totalStudents, allStudents, totalPagesInSubject] = await Promise.all([
    prisma.user.count({ where: whereCondition }),
    prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" }
    }),
    prisma.page.count({
      where: { topic: { chapter: { book: { class_subject_id: csId } } } }
    })
  ]);

  const allStudentIds = allStudents.map(s => s.id);
  
  const [{ accMap: allAccMap, progMap: allProgMap }] = await Promise.all([
    getStudentsStats({
      studentIds: allStudentIds,
      csIds: [csId],
      totalPagesCount: totalPagesInSubject
    })
  ]);

  const sortedStudents = [...allStudents].map(s => ({
    ...s,
    accuracy: allAccMap.get(s.id) || 0,
    progress: allProgMap.get(s.id) || 0
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

  const studentsPage = sortedStudents.slice(skip, skip + take);

  const buildQueryString = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (sp.page) next.set("page", sp.page.toString());
    if (sort) next.set("sort", sort);
    for (const [k, v] of Object.entries(updates)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <TeacherDashboard
      title={`${sub.name} - Class ${cls.name}`}
      breadcrumbs={[
        { label: "Classes", href: "/teacher" },
        { label: `Class ${cls.name}`, href: `/teacher/class/${cls.id}` },
        { label: sub.name }
      ]}
      table={{
        title: "Enrolled Students",
        students: studentsPage,
        totalStudents,
        searchQuery: query,
        progressLabel: "Course Progress",
        reportBasePath: `/teacher/subject/${csId}/student`,
        sort,
        buildQueryString,
      }}
    />
  );
}
