import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/auth';
import { Breadcrumb } from '@/components/ui/core-breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComments, faClone, faNoteSticky, faHighlighter, faMessage,
    faPlay
} from '@fortawesome/free-solid-svg-icons';
import { getCachedBookCurriculum } from '@/lib/queries/learning';
import { getCachedBookWithProgress } from '@/lib/students/chapter';
import { ChapterAccordion } from '@/components/student/learn/chapter/ChapterAccordion';
import { LeaderboardSidebar } from '@/components/student/learn/chapter/LeaderboardSidebar';

export default async function SyllabusBookPage({ params }: { params: Promise<{ bookId: string }> }) {
    const session = await getAuthUser();
    if (!session) redirect('/login');

    const { bookId: bookIdStr } = await params;
    const bookId = parseInt(bookIdStr, 10);
    if (isNaN(bookId)) redirect('/student/learn/chapter');

    const data = await getCachedBookWithProgress(bookId, session.userId, session.schoolId);

    if (!data) return <div className="p-8">Book not found.</div>;

    const { book, allTopicProgress } = data;

    const dbChapters = await getCachedBookCurriculum(book.id);

    const totalChapters = dbChapters.length;
    let completedChapters = 0;

    const enrichedChapters = dbChapters.map(ch => {
        let completedTopics = 0;
        const enrichedTopics = ch.topics.map(t => {
            const p = allTopicProgress.find(ap => ap.topic_id === t.id);
            const acc = Number(p?.accuracy || 0);
            const isCompleted = acc >= 0.8;
            if (isCompleted) completedTopics++;

            return {
                ...t,
                progressStatus: isCompleted ? 'completed' : (acc > 0 ? 'in_progress' : 'not_started'),
                progressPercent: acc * 100
            };
        });

        if (enrichedTopics.length > 0 && completedTopics === enrichedTopics.length) {
            completedChapters++;
        }

        return { ...ch, topics: enrichedTopics };
    });

    const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return (
        <div className="flex w-full h-full gap-8 py-8 pl-6 pr-8">

            <div className="flex-1 flex flex-col min-w-0">

                <div className="mb-6 flex items-center gap-2 text-sm">
                    <Link
                        href="/student/learn/chapter"
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        &lt;
                    </Link>
                    <Breadcrumb crumbs={[
                        { label: 'Home', href: '/student' },
                        { label: 'My Books', href: '/student/learn/subject' },
                        { label: book.title, href: '#' }
                    ]} />
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center justify-between mb-8 relative overflow-hidden">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-32 bg-amber-200 rounded-md shadow-sm border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
                            <div className="text-amber-700 font-bold text-lg p-2 text-center leading-tight">
                                {book.title}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-extrabold text-amber-950 mb-2">{book.title}</h1>
                            <p className="text-amber-800 font-medium text-sm">
                                {book.class_subject.subject.name} Core • {completedChapters}/{totalChapters} Chapters Completed
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white shrink-0">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-amber-200"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-emerald-500 transition-all duration-1000 ease-out"
                                    strokeDasharray={`${overallProgress}, 100`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-sm font-bold text-slate-700">{overallProgress}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 leading-tight">
                            {completedChapters}/{totalChapters}<br />chapters
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-base font-bold text-slate-800 mb-3">Activity</h2>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {[
                            { icon: faComments, label: 'Chats', val: 5, tab: 'chat' },
                            { icon: faClone, label: 'Flashcard sets', val: 3, tab: 'flashcards' },
                            { icon: faNoteSticky, label: 'Notes', val: 12, tab: 'notes' },
                            { icon: faHighlighter, label: 'Highlights', val: 125, tab: 'notes' },
                            { icon: faMessage, label: 'Comments', val: 18, tab: 'discussion' }
                        ].map(act => (
                            <Link
                                key={act.label}
                                href={`/student/learn/learning/${enrichedChapters[0]?.topics[0]?.id || 1}?tab=${act.tab}`}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full whitespace-nowrap hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <FontAwesomeIcon icon={act.icon} className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-600">{act.label}</span>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{act.val}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-base font-bold text-slate-800 mb-3">Today&apos;s Actions</h2>
                    <div className="bg-white rounded-2xl p-5 border-2 border-purple-500 shadow-md shadow-purple-500/10 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                        <div className="flex items-center gap-5 pl-2">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center text-3xl">
                                🌍
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {enrichedChapters[0]?.title || 'Up Next'}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {enrichedChapters[0]?.topics[0]?.title || 'Start Learning'}
                                </h3>
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[83%] rounded-full"></div>
                                    </div>
                                    83% • Yesterday
                                </div>
                            </div>
                        </div>
                        <a href={`/student/learn/learning/${enrichedChapters[0]?.topics[0]?.id || 1}`} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2">
                            Continue
                        </a>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-base font-bold text-slate-800 mb-3">Chapters</h2>
                    <div className="flex flex-col gap-3">
                        {enrichedChapters.map((chapter) => (
                            <ChapterAccordion key={chapter.id} chapter={chapter} />
                        ))}
                    </div>
                </div>
                <LeaderboardSidebar />
            </div>


        </div>
    );
}
