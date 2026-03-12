import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Users, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user?.userId) {
    redirect("/login");
  }

  const userRow = await prisma.user.findUnique({
    where: {
      id: session.user.userId,
    },
    select: {
      name: true,
      user_class_subject: {
        include: {
          class_subject: {
            include: {
              class: true,
              subject: true,
            }
          }
        }
      }
    },
  });

  const teacherName = userRow?.name || "Teacher";
  const assignedSubjects = userRow?.user_class_subject || [];

  // Calculate unique total students across all assigned classes
  const assignedCsIds = assignedSubjects.map((a) => a.class_subject_id);
  
  const [totalStudents, studentCounts] = await Promise.all([
    prisma.user.count({
      where: {
        role: "student",
        school_id: session.user.schoolId,
        user_class_subject: {
          some: { class_subject_id: { in: assignedCsIds } }
        }
      }
    }),
    prisma.userClassSubject.groupBy({
      by: ['class_subject_id'],
      where: {
        class_subject_id: { in: assignedCsIds },
        user: { role: "student", school_id: session.user.schoolId }
      },
      _count: { user_id: true }
    })
  ]);

  const getStudentCount = (csId: number) => {
    return studentCounts.find(s => s.class_subject_id === csId)?._count.user_id || 0;
  };

  type ClassSubjectWithRelations = (typeof assignedSubjects)[number];
  const uniqueClasses = Array.from(
    new Map(assignedSubjects.map((a: ClassSubjectWithRelations) => [a.class_subject.class.id, a.class_subject.class])).values()
  );

  const uniqueSubjects = Array.from(
    new Map(assignedSubjects.map((a: ClassSubjectWithRelations) => [a.class_subject.subject.id, a.class_subject.subject])).values()
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {teacherName}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here is an overview of your assigned classes and aggregated student metrics.
          </p>
        </div>
        <div className="bg-white border shadow-sm flex items-center gap-4 py-2 px-4 rounded-lg shrink-0">
          <div className="p-2 bg-slate-100 text-slate-600 rounded-md">
             <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-xl font-bold text-slate-900 leading-none mt-0.5">{totalStudents}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Assigned Class Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedSubjects.map((assignment: ClassSubjectWithRelations) => {
            const cs = assignment.class_subject;
            return (
              <Link key={cs.id} href={`/teacher/subject/${cs.id}`} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 relative overflow-hidden flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="flex items-center text-xs px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {getStudentCount(cs.id)} Students
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">
                      Class {cs.class.name}
                    </h4>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cs.subject.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
          {assignedSubjects.length === 0 && (
            <div className="col-span-full py-16 px-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700 mb-1">No Classes Assigned</h3>
              <p className="text-slate-500 text-sm">You do not have any classes or subjects assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Classes Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {uniqueClasses.map((cls) => (
              <Link key={cls.id} href={`/teacher/class/${cls.id}`} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 relative overflow-hidden flex flex-col h-full">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                    Class {cls.name}
                  </h3>
                  <p className="text-sm text-slate-500">View progress & analytics for this entire class.</p>
                  <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
                    View Class <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Subjects Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {uniqueSubjects.map((sub) => (
              <Link key={sub.id} href={`/teacher/subject-overview/${sub.id}`} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 relative overflow-hidden flex flex-col h-full">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
                    {sub.name}
                  </h3>
                  <p className="text-sm text-slate-500">View performance across all classes for this subject.</p>
                  <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                    View Subject <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
