"use server";
import { StreakPanel } from "@/components/student/dashboard/StreakPanel";
import { TrophiesPanel } from "@/components/student/dashboard/TrophiesPanel";
import { StatCard } from "@/components/student/dashboard/StatCard";
import { WeakTopicsCard } from "@/components/student/dashboard/WeakTopicsCard";
import { TodayRevisions } from "@/components/student/dashboard/TodayRevisions";
import { Backlogs } from "@/components/student/dashboard/Backlogs";
import { Target, Medal, Zap } from "lucide-react";
import {
  getStudentAccuracyAndProgress,
  getStudentXpAndStreak,
  getWeakTopics,
  getRevisionTopics,
  getSubjectWiseAccuracyAndProgress,
} from "@/features/student/actions/student.action";
import { fetchUserById } from "@/lib/admin/data";
import { getAuthUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { ChartExample } from "@/components/student/dashboard/example-chart";
import { getStartOfToday } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getAuthUser();
  if (!session) redirect("/login");

  const [
    { overallAccuracy, overallProgress },
    { totalXp, currentStreak, lastActiveDate },
    user,
    weakTopics,
    revisionTopics,
    subjectWiseAccuracyAndProgress,
  ] = await Promise.all([
    getStudentAccuracyAndProgress(session.userId),
    getStudentXpAndStreak(session.userId),
    fetchUserById(session.userId),
    getWeakTopics(session.userId),
    getRevisionTopics(session.userId),
    getSubjectWiseAccuracyAndProgress(session.userId),
  ]);

  function splitRevisions(revisions: Awaited<ReturnType<typeof getRevisionTopics>>) {
    const today = getStartOfToday();

    type RevisionType = Awaited<ReturnType<typeof getRevisionTopics>>[number];
    const todayRevisions: RevisionType[] = [];
    const backlogRevisions: RevisionType[] = [];

    for (const r of revisions) {
      const revisionDate = new Date(r.next_revision_at);
      revisionDate.setHours(0, 0, 0, 0);

      if (revisionDate.getTime() === today.getTime()) {
        todayRevisions.push(r);
      } else if (revisionDate.getTime() < today.getTime()) {
        backlogRevisions.push(r);
      }
    }

    return { todayRevisions, backlogRevisions };
  }
  const weakFormattedtopics = weakTopics.map(
    (topic: Awaited<ReturnType<typeof getWeakTopics>>[number]) => ({
      ...topic,
      accuracy: topic.accuracy ? Number(topic.accuracy.toNumber().toFixed(2)) : 0,
    }),
  );

  const { todayRevisions, backlogRevisions } = splitRevisions(revisionTopics);
  const userName = user?.name ?? "User";
  logger.info(`Dashboard accessed by user: ${userName}`);
  logger.info(`Weaker Topics: ${JSON.stringify(weakTopics)}`);

  return (
    <div className="py-8 pl-6 pr-8 w-full min-h-screen flex flex-col">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600 mb-6 sm:mb-8 tracking-tight">
        Welcome {userName},
      </h1>

      <div className="flex flex-col gap-4 sm:gap-6 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full items-start">
          <div className="w-full sm:w-3/4">
            <StreakPanel currentStreak={currentStreak} lastActiveDate={lastActiveDate} />
          </div>
          <div className="w-full sm:w-1/4">
            <TrophiesPanel totalXp={totalXp} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
        {/* Left Column - Statistics and Weak Topics */}
        <div className="flex flex-col gap-6 lg:gap-12 flex-1 lg:max-w-sm xl:max-w-md">
          <div>
            <h2 className="text-base sm:text-[17px] font-bold text-gray-700 mb-3 sm:mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <StatCard
                icon={<Medal className="w-6 sm:w-7 h-6 sm:h-7 text-orange-400 fill-orange-400" />}
                value={`${overallProgress}%`}
                label="Overall Progress"
                borderColorClass="border-orange-400"
                valueColorClass="text-orange-400"
                variant="default"
              />
              <StatCard
                icon={
                  <div className="relative">
                    <Target className="w-6 sm:w-7 h-6 sm:h-7 text-red-500" />
                    <div className="absolute top-2 left-2 w-2.75 h-2.75 bg-red-500 rounded-full" />
                  </div>
                }
                value={`${overallAccuracy}%`}
                label="Average Accuracy"
                borderColorClass="border-[#00BB79]"
                valueColorClass="text-[#00BB79]"
                variant="default"
              />
            </div>
            <StatCard
              icon={<Zap className="w-6 sm:w-7 h-6 sm:h-7 text-blue-500 fill-blue-500" />}
              value={`${totalXp} XP`}
              label="Total XP Earned"
              borderColorClass="border-blue-500"
              valueColorClass="text-blue-500"
              variant="first"
            />
          </div>

          <div>
            <h2 className="text-base sm:text-[17px] font-bold text-gray-700 mb-3 sm:mb-4 w-full">
              Weak Topics
            </h2>
            <WeakTopicsCard weakTopics={weakFormattedtopics} />
          </div>
        </div>

        {/* Right Column - Revisions and Charts */}
        <div className="flex flex-col gap-8 lg:gap-8 flex-1 lg:flex-[1.5]">
          {/* Today's Revisions and Backlogs */}
          <div className="flex flex-col sm:flex-row w-full gap-4 sm:gap-6">
            <div className="flex-1 flex flex-col">
              <h2 className="text-base sm:text-[17px] font-bold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                Today&apos;s Revisions
                <span className="text-xs sm:text-sm px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-semibold">
                  {todayRevisions.length}
                </span>
              </h2>
              <TodayRevisions revisions={todayRevisions} />
            </div>

            <div className="flex-1 flex flex-col">
              <h2 className="text-base sm:text-[17px] font-bold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                Backlogs
                <span className="text-xs sm:text-sm px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-semibold">
                  {backlogRevisions.length}
                </span>
              </h2>
              <Backlogs revisions={backlogRevisions} />
            </div>
          </div>

          {/* Subject-wise Performance Chart */}
          <div className="flex flex-col">
            <h2 className="text-base sm:text-[17px] font-bold text-gray-700 mb-3 sm:mb-4">
              Subject-wise Performance
            </h2>
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm flex items-center justify-center overflow-auto">
              <ChartExample subjectWiseAccuracyAndProgress={subjectWiseAccuracyAndProgress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
