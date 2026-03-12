import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedLatestChapterProgress = unstable_cache(
    async (userId: number, schoolId: number) => {
        return await prisma.studentTopicProgress.findFirst({
            where: { student_id: userId },
            orderBy: { last_activity_at: 'desc' },
            include: { topic: { include: { chapter: true } } }
        });
    },
    ['chapter-latest-progress'],
    { tags: ['student-progress'] }
);

export const getCachedFirstAvailableBook = unstable_cache(
    async () => {
        return await prisma.book.findFirst({ orderBy: { id: 'asc' } });
    },
    ['chapter-first-book'],
    { tags: ['global-books'] }
);

export const getCachedBookWithProgress = unstable_cache(
    async (bookId: number, userId: number, schoolId: number) => {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: {
                class_subject: { include: { subject: true } }
            }
        });

        if (!book) return null;

        const allTopicProgress = await prisma.studentTopicProgress.findMany({
            where: { student_id: userId }
        });

        return { book, allTopicProgress };
    },
    ['chapter-book-progress'],
    { tags: ['student-progress', 'global-books'] }
);
