import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherStudentReport from "@/components/teacher/teacher-student-report";

export default async function StudentDetail({
  params
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.userId) redirect("/login");
  
  const { id, studentId } = await params;
  const csId = Number(id);
  const sId = Number(studentId);

  const classSubject = await prisma.classSubject.findUnique({
    where: { id: csId },
    include: { subject: true, class: true }
  });

  return (
    <TeacherStudentReport
      studentId={sId}
      csIds={[csId]}
      breadcrumbs={[
        { label: "Class Analytics", href: `/teacher/subject/${id}` }
      ]}
      subtitle={`${classSubject?.class?.name} • ${classSubject?.subject?.name}`}
      progressTitle="Course Progress"
      topicColumnType="book"
      emptyMessage="No topics found for this class."
    />
  );
}
