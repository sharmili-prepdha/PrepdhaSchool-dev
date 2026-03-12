import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Target, TrendingUp, AlertCircle, Calendar, Home, ChevronRight } from "lucide-react";

export interface TeacherStudentReportProps {
  studentId: number;
  csIds: number[];
  breadcrumbs: { label: string; href: string }[];
  subtitle: string;
  progressTitle: string;
  topicColumnType: "book" | "subject" | "class";
  emptyMessage: string;
}

export default async function TeacherStudentReport({
  studentId,
  csIds,
  breadcrumbs,
  subtitle,
  progressTitle,
  topicColumnType,
  emptyMessage
}: TeacherStudentReportProps) {
  const student = await prisma.user.findUnique({
    where: { id: studentId }
  });

  if (!student || student.role !== "student") return <div>Student not found</div>;
  if (csIds.length === 0) return <div className="p-8 text-center text-slate-500">No subjects assigned for this view.</div>;

  const books = await prisma.book.findMany({
    where: { class_subject_id: { in: csIds } },
    include: {
      class_subject: {
        include: { class: true, subject: true }
      },
      chapters: {
        include: {
          topics: {
            include: {
              page: true
            }
          }
        }
      }
    }
  });

  const totalPages = await prisma.page.count({
    where: { topic: { chapter: { book: { class_subject_id: { in: csIds } } } } }
  });

  const [topicProgress, pageProgress] = await Promise.all([
    prisma.studentTopicProgress.findMany({
      where: {
        student_id: studentId,
        class_subject_id: { in: csIds }
      }
    }),
    prisma.studentPageProgress.findMany({
      where: {
        student_id: studentId,
        class_subject_id: { in: csIds },
        is_completed: true
      }
    })
  ]);

  let avgAcc = 0;
  if (topicProgress.length > 0) {
    avgAcc = topicProgress.reduce((acc, curr) => acc + (Number(curr.accuracy) || 0), 0) / topicProgress.length;
  }
  const progPercentage = totalPages > 0 ? (pageProgress.length / totalPages) * 100 : 0;

  // Enhance topics with stats
  const enrichedTopics = books.flatMap(b => 
    b.chapters.flatMap(c => 
      c.topics.map(t => {
        const tp = topicProgress.find(p => p.topic_id === t.id);
        const pagesCompleted = pageProgress.filter(p => t.page.some(topicPage => topicPage.id === p.page_id)).length;
        const tpPercent = t.page.length > 0 ? (pagesCompleted / t.page.length) * 100 : 0;
        
        return {
          ...t,
          bookTitle: b.title,
          chapterTitle: c.title,
          className: b.class_subject.class.name,
          subjectName: b.class_subject.subject.name,
          accuracy: Number(tp?.accuracy) || 0,
          progress: tpPercent,
          lastActive: tp?.last_activity_at
        };
      })
    )
  );

  enrichedTopics.sort((a, b) => b.accuracy - a.accuracy); // Sort highest accuracy first
  const weakestTopics = [...enrichedTopics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-2 font-medium">
            <Link href="/teacher" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            {breadcrumbs.map((bc, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href={bc.href} className="hover:text-slate-900 transition-colors">
                  {bc.label}
                </Link>
              </div>
            ))}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900">{student.name}</span>
          </nav>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1.5">
              {student.name}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 leading-none mb-1">Last Active</span>
            <span className="text-sm font-semibold text-slate-900 leading-none">
              {topicProgress.length > 0 
                ? new Date(Math.max(...topicProgress.map(t => new Date(t.last_activity_at || 0).getTime()))).toLocaleDateString()
                : "Never"
              }
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden relative flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">Overall Accuracy</h3>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{avgAcc.toFixed(1)}%</p>
          <p className="text-xs font-medium text-slate-500">Average across {topicProgress.length} topics</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden relative flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{progressTitle}</h3>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{progPercentage.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progPercentage}%` }} />
          </div>
        </div>

        <div className="bg-orange-50/50 rounded-xl border border-orange-200/60 p-5 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-orange-800 uppercase tracking-widest">Needs Review</h3>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <ul className="space-y-2 mt-auto">
            {weakestTopics.map(t => (
              <li key={t.id} className="text-sm flex justify-between items-center bg-white px-3 py-2 rounded-md border border-orange-100/50 shadow-sm">
                <span className="font-medium text-slate-700 truncate pr-2">
                  {t.title}
                  {topicColumnType === "subject" && <span className="text-xs text-slate-400 ml-1">({t.subjectName})</span>}
                  {topicColumnType === "class" && <span className="text-xs text-slate-400 ml-1">({t.className})</span>}
                </span>
                <span className="shrink-0 font-bold bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[11px] tracking-tight">{t.accuracy.toFixed(0)}%</span>
              </li>
            ))}
            {weakestTopics.length === 0 && <p className="text-sm text-slate-500 italic">No data available.</p>}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Topic Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className={`px-5 py-3.5 tracking-tight ${topicColumnType === "book" ? "w-1/3" : "w-[25%]"}`}>Topic</th>
                <th className={`px-5 py-3.5 tracking-tight ${topicColumnType === "book" ? "" : "w-[25%]"}`}>
                  {topicColumnType === "book" && "Book"}
                  {topicColumnType === "subject" && "Subject & Book"}
                  {topicColumnType === "class" && "Class & Book"}
                </th>
                <th className={`px-5 py-3.5 tracking-tight ${topicColumnType === "book" ? "w-1/4" : "w-[20%]"}`}>Progress</th>
                <th className="px-5 py-3.5 tracking-tight text-center">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedTopics.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4 font-semibold text-slate-900">{t.title}</td>
                  <td className="px-5 py-4">
                    {topicColumnType === "book" && <span className="text-slate-500">{t.bookTitle}</span>}
                    {topicColumnType === "subject" && (
                      <>
                        <p className="font-medium text-slate-700 mb-0.5">{t.subjectName}</p>
                        <p className="text-xs text-slate-500">{t.bookTitle}</p>
                      </>
                    )}
                    {topicColumnType === "class" && (
                      <>
                        <p className="font-medium text-slate-700 mb-0.5">{t.className}</p>
                        <p className="text-xs text-slate-500">{t.bookTitle}</p>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-slate-500 shrink-0 text-right">{t.progress.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono tracking-tight ${
                      t.accuracy < 50 ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10 ring-inset' :
                      t.accuracy < 80 ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10 ring-inset' :
                      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 ring-inset'
                    }`}>
                      {t.accuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {enrichedTopics.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
