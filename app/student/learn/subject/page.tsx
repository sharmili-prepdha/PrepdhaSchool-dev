import { JumpBackCard } from "@/components/student/learn/subject/JumpBackCard";
import { KeepLearningCard, ChapterStep } from "@/components/student/learn/subject/KeepLearningCard";
import { SubjectCard } from "@/components/student/learn/subject/SubjectCard";
import { TopicCard } from "@/components/student/learn/subject/TopicCard";
import { getAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from "next/navigation";
import {
  getCachedRecentTopics,
  getCachedActiveChapter,
  getCachedAssignedBooks,
  getCachedNextTopics
} from '@/lib/students/dashboard';

export default async function StudentDashboardPage() {
  const session = await getAuthUser();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });
  if (!user) redirect('/login');

  const firstName = user?.name?.split(' ')[0] || "Student";

  const [recentTopics, activeChapterData, assignedBooksData, nextTopics] = await Promise.all([
    getCachedRecentTopics(session.userId, session.schoolId),
    getCachedActiveChapter(session.userId, session.schoolId),
    getCachedAssignedBooks(session.userId, session.schoolId),
    getCachedNextTopics(session.userId, session.schoolId)
  ]);

  return (
    <div className="py-8 pl-6 pr-8 w-full flex flex-col gap-10">

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Jump Back In</h2>
        {recentTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTopics.map((progress, index) => {
              const bgColors = ["bg-blue-50", "bg-emerald-50", "bg-amber-50"];
              const textColors = ["text-blue-600", "text-emerald-600", "text-amber-600"];
              const progressColors = ["bg-[#7C31F6]", "bg-[#00BB79]", "bg-amber-500"];
              const icons = ["📱", "🧪", "🏛️"];

              const cIndex = index % 3;

              return (
                <JumpBackCard
                  key={progress.topic_id}
                  subject={progress.topic.chapter.book.title.toUpperCase()}
                  chapter={`CH ${progress.topic.chapter.order_no || progress.topic.chapter_id}`}
                  title={progress.topic.title}
                  progress={Number(progress.accuracy || 0) * 100}
                  xp={54}
                  icon={<span className="text-2xl">{icons[cIndex]}</span>}
                  iconBg={bgColors[cIndex]}
                  color={textColors[cIndex]}
                  progressColor={progressColors[cIndex]}
                  topicId={progress.topic_id}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-100 rounded-3xl text-center">
            <span className="text-5xl mb-4">🚀</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No recent activity</h3>
            <p className="text-slate-500">Pick a book from below and start your learning journey to see quick links here.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Keep Learning, {firstName}</h2>
        {activeChapterData ? (
          <KeepLearningCard
            title={activeChapterData.chapter.title}
            subtitle={`${activeChapterData.chapter.book.class_subject.subject.name} • ${activeChapterData.topicProgresses.filter(p => Number(p.accuracy) >= 0.8).length}/${activeChapterData.chapter.topics.length} Topics Completed`}
            steps={activeChapterData.chapter.topics.map((t, index): ChapterStep => {
              const prog = activeChapterData.topicProgresses.find(p => p.topic_id === t.id);
              const acc = Number(prog?.accuracy || 0);
              let status: 'completed' | 'current' | 'locked' = 'locked';

              if (acc >= 0.8) {
                status = 'completed';
              } else if (prog !== undefined) {
                status = 'current';
              } else if (index === 0 || Number(activeChapterData.topicProgresses.find(p => p.topic_id === activeChapterData.chapter.topics[index - 1]?.id)?.accuracy || 0) >= 0.8) {
                status = 'current';
              }

              return {
                id: t.id,
                title: `${index + 1}. ${t.title}`,
                status
              };
            })}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-100 rounded-3xl text-center">
            <span className="text-5xl mb-4">📚</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Your learning path awaits</h3>
            <p className="text-slate-500">Jump into your first chapter and your curriculum progress will be tracked right here.</p>
          </div>
        )}
      </section>

      {assignedBooksData.userClassSubjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assignedBooksData.userClassSubjects.flatMap(ucs =>
              ucs.class_subject.books.map(book => {
                const bookTopics = book.chapters.flatMap(c => c.topics);
                const totalTopics = bookTopics.length;
                let completedTopics = 0;
                let lastSeenDate: Date | null = null;

                for (const t of bookTopics) {
                  const p = assignedBooksData.allProgress.find(ap => ap.topic_id === t.id);
                  if (p) {
                    if (Number(p.accuracy) >= 0.8) completedTopics++;
                    if (!lastSeenDate || (p.last_activity_at && p.last_activity_at > lastSeenDate)) {
                      lastSeenDate = p.last_activity_at;
                    }
                  }
                }

                const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                let lastSeenStr = "Started";
                if (lastSeenDate) {
                  const diffTime = Math.abs(new Date().getTime() - new Date(lastSeenDate).getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  lastSeenStr = diffDays === 1 ? '1d ago' : `${diffDays}d ago`;
                }

                return (
                  <SubjectCard
                    key={`book-${book.id}`}
                    title={book.title}
                    status={progress < 20 && lastSeenDate && (new Date().getTime() - new Date(lastSeenDate).getTime()) > (7 * 24 * 60 * 60 * 1000) ? "AT RISK" : "ON TRACK"}
                    progress={progress}
                    image={`/assets/images/book_${ucs.class_subject.subject.name.toLowerCase()}.jpg`}
                    lastSeen={lastSeenStr}
                    href={`/student/learn/chapter/${book.id}`}
                  />
                );
              })
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Up Next</h2>
        <div className="flex flex-col gap-4">
          {nextTopics.map((progress, index) => {
            const gradients = ["bg-red-50 text-red-500", "bg-blue-50 text-blue-500", "bg-emerald-50 text-emerald-500"];
            const icons = ["💔", "🔢", "🌿"];
            const gIndex = index % 3;

            return (
              <TopicCard
                key={`topic-${progress.topic_id}`}
                subject={progress.topic.chapter.book.title.toUpperCase()}
                chapter={`CH ${progress.topic.chapter.order_no || progress.topic.chapter_id} - ${progress.topic.chapter.title.toUpperCase()}`}
                topic={progress.topic.title}
                title={progress.topic.title}
                tags={[]}
                gradient={gradients[gIndex]}
                icon={icons[gIndex]}
                xp={54}
                topicId={progress.topic.id}
              />
            )
          })}
        </div>
      </section>

    </div>
  );
}
