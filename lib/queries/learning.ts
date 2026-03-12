import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Cache the topic lookup including its parent chapter and book
export const getCachedTopicContext = unstable_cache(
    async (topicId: number) => {
        return await prisma.topic.findUnique({
            where: { id: topicId },
            include: {
                chapter: {
                    include: { book: true }
                }
            }
        });
    },
    ['topic-context'], // Base cache key
    {
        revalidate: 3600, // Revalidate every hour
        tags: ['curriculum'], // Bust cache using revalidateTag('curriculum')
    }
);

// Cache the curriculum structure (all chapters and topics for a given book)
export const getCachedBookCurriculum = unstable_cache(
    async (bookId: number) => {
        return await prisma.chapter.findMany({
            where: { book_id: bookId },
            orderBy: { order_no: 'asc' },
            include: {
                topics: {
                    orderBy: { order_no: 'asc' }
                }
            }
        });
    },
    ['book-curriculum'],
    {
        revalidate: 3600,
        tags: ['curriculum'],
    }
);
