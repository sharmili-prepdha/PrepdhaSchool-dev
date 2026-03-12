import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherStudentReport from "@/components/teacher/teacher-student-report";

export default async function SubjectStudentDetail({
  params
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.userId) redirect("/login");
  
  const { id, studentId } = await params;
  const subjectId = Number(id);
  const sId = Number(studentId);

  const subjectRecord = await prisma.subject.findUnique({ where: { id: subjectId } });

  const assignedClassSubjects = await prisma.userClassSubject.findMany({
    where: {
      user_id: session.user.userId,
      class_subject: { subject_id: subjectId }
    },
    select: { class_subject_id: true }
  });

  const csIds = assignedClassSubjects.map(acs => acs.class_subject_id);

  return (
    <TeacherStudentReport
      studentId={sId}
      csIds={csIds}
      breadcrumbs={[
        { label: `${subjectRecord?.name} Overview`, href: `/teacher/subject-overview/${id}` }
      ]}
      subtitle={`Subject: ${subjectRecord?.name}`}
      progressTitle="Subject Progress"
      topicColumnType="class"
      emptyMessage="No topics found for this subject."
    />
  );
}
