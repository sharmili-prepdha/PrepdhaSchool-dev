import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faChevronLeft, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';

import { Button } from "@/components/ui/core-button";
import { Progress } from "@/components/ui/core-progress";
import { Badge } from "@/components/ui/core-badge";
import { Breadcrumb } from "@/components/ui/core-breadcrumb";
import { LeftPanel } from '@/components/student/learn/learning/panels/LeftPanel';
import { PageContentPanel } from '@/components/student/learn/learning/panels/PageContentPanel';
import { RightContentPanel } from '@/components/student/learn/learning/panels/RightContentPanel';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/auth';
import { getCachedTopicContext, getCachedBookCurriculum } from '@/lib/queries/learning';
import { getCachedUserSessionData } from '@/lib/students/global';
import {
  getCachedAllUserTopicProgress,
  getCachedTopicFirstPage,
  getCachedStudentPageProgress
} from '@/lib/students/learning-engine';

type PageProps = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function Home({ params, searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const resolvedRouteParams = await params;
  const activeTab = (resolvedParams?.tab || 'chat') as 'chat' | 'flashcards' | 'discussion' | 'notes' | 'edit';
  const urlTopicId = parseInt(resolvedRouteParams.topicId, 10);

  if (isNaN(urlTopicId)) {
    redirect('/student');
  }

  const session = await getAuthUser();
  if (!session) redirect('/login');

  const activeTopic = await getCachedTopicContext(urlTopicId);

  if (!activeTopic) return <div className="p-8 text-center text-slate-500 font-medium text-lg">No content available. Please run `npx tsx prisma/seed.ts`.</div>;

  const activeBook = activeTopic.chapter.book;

  const dbChapters = await getCachedBookCurriculum(activeBook.id);
  const allTopicProgress = await getCachedAllUserTopicProgress(session.userId, session.schoolId);

  const mappedChapters = dbChapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    topics: ch.topics.map(t => {
      const progressRecord = allTopicProgress.find(p => p.topic_id === t.id);
      let progressStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      let progressPercent = 0;

      if (progressRecord) {
        const accuracy = Number(progressRecord.accuracy || 0);
        if (accuracy >= 0.8) {
          progressStatus = 'completed';
        } else {
          progressStatus = 'in_progress';
          progressPercent = accuracy * 100;
        }
      }

      return {
        id: t.id,
        title: t.title,
        progress: progressStatus,
        progressPercent
      };
    })
  }));

  const targetPage = await getCachedTopicFirstPage(activeTopic.id);

  let initialIsRead = false;
  let pageHtml = "";
  let pageId = 0;

  if (targetPage) {
    pageId = targetPage.id;
    pageHtml = targetPage.content_html || "";

    const pageProgress = await getCachedStudentPageProgress(session.userId, session.schoolId, targetPage.id);

    if (pageProgress?.is_completed) {
      initialIsRead = true;
    }
  }

  const sessionData = await getCachedUserSessionData(session.userId, session.schoolId);
  const totalXp = sessionData.totalXp;

  return (
    <div className="w-full h-full bg-slate-50 font-[family-name:var(--font-outfit)] text-slate-900">

      <div className="w-full">

        <div className="pl-6 pr-8 py-6 flex items-start justify-between border-b border-slate-200 bg-white">
          <div className="flex items-start gap-4">
            <Link
              href={`/student/learn/chapter/${activeBook.id}`}
              className="h-10 w-10 shrink-0 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            </Link>

            <div className="flex flex-col">
              <Breadcrumb
                crumbs={[
                  { label: 'My Books', href: '/student/learn/chapter' },
                  { label: activeBook.title, href: `/student/learn/chapter/${activeBook.id}` },
                  { label: activeTopic.chapter.title, href: '#' }
                ]}
                className="mb-1"
              />
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeTopic.title}
                </h1>
                <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                <Badge className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-3 py-0.5 gap-1.5 shadow-sm border-0 font-semibold tracking-wide h-6">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" /> Needs Attention
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                  30%
                </div>
                <Progress value={30} className="w-24 h-2 bg-slate-100 [&>div]:bg-emerald-500" />
              </div>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm gap-2 h-10 font-medium">
              <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5" /> 54 XP
            </Button>
          </div>
        </div>

        <div className="flex gap-8 pl-6 pr-8 py-8 items-start">
          <LeftPanel chapters={mappedChapters} activeTopicId={activeTopic.id} />
          <PageContentPanel
            pageId={pageId}
            pageOrder={targetPage?.page_order || 1}
            contentHtml={pageHtml}
            initialIsRead={initialIsRead}
          />
          <RightContentPanel activeTab={activeTab} />
        </div>

      </div>
    </div>
  );
}
