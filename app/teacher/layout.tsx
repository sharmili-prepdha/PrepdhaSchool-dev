import { Sidebar } from "@/components/teacher/sidebar";
import { TopNav } from "@/components/teacher/top-nav";
import { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto w-full p-6 md:p-8 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
