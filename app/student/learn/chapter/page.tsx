import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/auth';
import { getCachedLatestChapterProgress, getCachedFirstAvailableBook } from '@/lib/students/chapter';

export default async function SyllabusRootPage() {
    const session = await getAuthUser();
    if (!session) redirect('/login');

    const lastProgress = await getCachedLatestChapterProgress(session.userId, session.schoolId);

    if (lastProgress) {
        redirect(`/student/learn/chapter/${lastProgress.topic.chapter.book_id}`);
    }

    const firstBook = await getCachedFirstAvailableBook();
    if (firstBook) {
        redirect(`/student/learn/chapter/${firstBook.id}`);
    }

    return <div className="p-8">No books available. Run seed script.</div>;
}
