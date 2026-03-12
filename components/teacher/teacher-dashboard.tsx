import Link from "next/link";
import { Search, ChevronRight, User, Home, PieChart, Activity } from "lucide-react";

export interface DashboardStudentStat {
  id: number;
  name: string;
  email: string | null;
  progress: number;
  accuracy: number;
}

export interface TeacherDashboardProps {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  metrics?: {
    avgAccuracy: number;
    totalProgress: number;
    accuracyLabel: string;
    progressLabel: string;
  };
  table: {
    title: string;
    students: DashboardStudentStat[];
    totalStudents: number;
    searchQuery: string;
    progressLabel: string;
    reportBasePath: string;
    sort?: string;
    buildQueryString?: (updates: Record<string, string | undefined>) => string;
  };
}

function SortToggle({ 
  field, 
  currentSort, 
  buildQueryString 
}: { 
  field: string; 
  currentSort?: string; 
  buildQueryString: (updates: Record<string, string | undefined>) => string;
}) {
  return (
    <div className="inline-flex items-center gap-1 ml-1">
      <Link
        href={buildQueryString({ page: "1", sort: `${field}_desc` })}
        className={currentSort === `${field}_desc` ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}
      >
        ↓
      </Link>
      <Link
        href={buildQueryString({ page: "1", sort: `${field}_asc` })}
        className={currentSort === `${field}_asc` ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}
      >
        ↑
      </Link>
    </div>
  );
}

export default function TeacherDashboard({
  title,
  breadcrumbs,
  metrics,
  table,
}: TeacherDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-2 font-medium">
            <Link href="/teacher" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            {breadcrumbs.map((bc, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-slate-900 transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-slate-900">{bc.label}</span>
                )}
              </div>
            ))}
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{metrics.accuracyLabel}</h3>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{metrics.avgAccuracy.toFixed(1)}%</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <PieChart className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{metrics.progressLabel}</h3>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{metrics.totalProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${metrics.totalProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{table.title}</h2>
            <p className="text-sm text-slate-500">{table.totalStudents} Total students</p>
          </div>
          <form className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              name="q"
              defaultValue={table.searchQuery}
              key={table.sort || "default"}
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </form>
        </div>
        
        <div className="flex-1 p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 tracking-tight">Student Name</th>
                <th className="px-5 py-3.5 tracking-tight w-1/3">
                  <div className="flex items-center">
                    <span>{table.progressLabel}</span>
                    {table.buildQueryString && (
                      <SortToggle field="progress" currentSort={table.sort} buildQueryString={table.buildQueryString} />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 tracking-tight text-center">
                  <div className="inline-flex items-center">
                    <span>Avg. Accuracy</span>
                    {table.buildQueryString && (
                      <SortToggle field="accuracy" currentSort={table.sort} buildQueryString={table.buildQueryString} />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 tracking-tight text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold shadow-sm">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500 font-medium tracking-tight truncate max-w-[150px]">{s.email || `ID: ${s.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${s.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold w-9 shrink-0 text-slate-500">{s.progress.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono tracking-tight ${
                      s.accuracy < 50 ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10 ring-inset' 
                        : s.accuracy < 80 ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10 ring-inset' 
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 ring-inset'
                    }`}>
                      {s.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link 
                      href={`${table.reportBasePath}/${s.id}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1.5 hover:bg-blue-50 rounded transition-colors inline-block"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
              {table.students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    No students found matching your search.
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
