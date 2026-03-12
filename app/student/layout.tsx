import { getAuthUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import {
  getStudentAccuracyAndProgress,
  getStudentXpAndStreak,
} from "@/features/student/actions/student.action";
import TopNav from "@/components/student/dashboard/TopNav";
import { Nunito } from "next/font/google";
import StudentSideNav from "@/components/student/dashboard/StudentSideNav";
const nunito = Nunito({
  subsets: ["latin"],
});

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthUser();
  logger.info("This is inside StudentLayout");
  if (!session) redirect("/login");
  const [{ overallAccuracy, overallProgress }, { totalXp, currentStreak }] = await Promise.all([
    getStudentAccuracyAndProgress(session.userId),
    getStudentXpAndStreak(session.userId),
  ]);

  return (
    <div
      className={`flex flex-col min-h-screen bg-background w-full ${nunito.className}`}
    >
      <TopNav
        overallAccuracy={overallAccuracy}
        overallProgress={overallProgress}
        totalXp={totalXp}
        currentStreak={currentStreak}
      />
      <div className="flex flex-1 pt-[65px]">
        <StudentSideNav />
        <main className="flex-1 w-full bg-[#fafafa]">
          {children}
        </main>
      </div>
    </div>
  );
}
