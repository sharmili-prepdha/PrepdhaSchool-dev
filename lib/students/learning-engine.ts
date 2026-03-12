import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedInitialLearningRoute = unstable_cache(
    async (userId: number, schoolId: number) => {
        const lastProgress = await prisma.studentTopicProgress.findFirst({
            where: { student_id: userId },
            orderBy: { last_activity_at: 'desc' },
        });

        if (lastProgress) {
            return { topicId: lastProgress.topic_id };
        }

        const firstTopic = await prisma.topic.findFirst({
            orderBy: { id: 'asc' },
        });

        if (firstTopic) {
            return { topicId: firstTopic.id };
        }

        return null;
    },
    ['learning-initial-route'],
    { tags: ['student-progress', 'global-topics'] }
);

export const getCachedAllUserTopicProgress = unstable_cache(
    async (userId: number, schoolId: number) => {
        return await prisma.studentTopicProgress.findMany({
            where: { student_id: userId }
        });
    },
    ['learning-all-topic-progress'],
    { tags: ['student-progress'] }
);

export const getCachedTopicFirstPage = unstable_cache(
    async (topicId: number) => {
        return await prisma.page.findFirst({
            where: { topic_id: topicId },
            orderBy: { page_order: 'asc' }
        });
    },
    ['learning-topic-first-page'],
    { tags: ['topic-pages'] }
);

export const getCachedStudentPageProgress = unstable_cache(
    async (userId: number, schoolId: number, pageId: number) => {
        return await prisma.studentPageProgress.findUnique({
            where: {
                student_id_page_id: {
                    student_id: userId,
                    page_id: pageId
                }
            }
        });
    },
    ['learning-page-progress'],
    { tags: ['student-progress'] }
);
