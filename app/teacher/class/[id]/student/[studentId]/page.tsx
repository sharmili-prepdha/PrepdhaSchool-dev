import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherStudentReport from "@/components/teacher/teacher-student-report";

export default async function ClassStudentDetail({
  params
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.userId) redirect("/login");
  
  const { id, studentId } = await params;
  const classId = Number(id);
  const sId = Number(studentId);

  const classRecord = await prisma.class.findUnique({ where: { id: classId } });

  const assignedClassSubjects = await prisma.userClassSubject.findMany({
    where: {
      user_id: session.user.userId,
      class_subject: { class_id: classId }
    },
    select: { class_subject_id: true }
  });

  const csIds = assignedClassSubjects.map(acs => acs.class_subject_id);

  return (
    <TeacherStudentReport
      studentId={sId}
      csIds={csIds}
      breadcrumbs={[
        { label: `Class ${classRecord?.name} Overview`, href: `/teacher/class/${id}` }
      ]}
      subtitle={`Class: ${classRecord?.name}`}
      progressTitle="Class Progress"
      topicColumnType="subject"
      emptyMessage="No topics found for this class."
    />
  );
}
