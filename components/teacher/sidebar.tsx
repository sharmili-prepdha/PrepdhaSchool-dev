import Link from "next/link";
import { Home, Settings, GraduationCap } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 text-slate-300 hidden md:flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <GraduationCap className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Prepdha Portal
        </h2>
      </div>
      <div className="px-4 py-6">
        <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Analytics & Classes</p>
        <nav className="flex-1 space-y-1">
          <Link 
            href="/teacher" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white/10 text-white font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Overview</span>
          </Link>
          <Link 
            href="/teacher/settings" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white font-medium transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
            TR
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Teacher Mode</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-widest">Enterprise</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
