import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedRecentTopics = unstable_cache(
    async (userId: number, schoolId: number) => {
        return await prisma.studentTopicProgress.findMany({
            where: { student_id: userId },
            orderBy: { last_activity_at: 'desc' },
            take: 3,
            include: {
                topic: {
                    include: {
                        chapter: {
                            include: {
                                book: {
                                    include: {
                                        class_subject: {
                                            include: {
                                                subject: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    },
    ['dashboard-recent'],
    { tags: ['student-progress'] }
);

export const getCachedActiveChapter = unstable_cache(
    async (userId: number, schoolId: number) => {

        const recentProgress = await prisma.studentTopicProgress.findFirst({
            where: { student_id: userId },
            orderBy: { last_activity_at: 'desc' },
            include: { topic: { include: { chapter: { include: { book: { include: { class_subject: { include: { subject: true } } } } } } } } }
        });

        if (!recentProgress) return null;

        const chapterId = recentProgress.topic.chapter_id;

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                topics: { orderBy: { order_no: 'asc' } },
                book: { include: { class_subject: { include: { subject: true } } } }
            }
        });

        if (!chapter) return null;


        const topicProgresses = await prisma.studentTopicProgress.findMany({
            where: { student_id: userId, topic_id: { in: chapter.topics.map(t => t.id) } }
        });

        return { chapter, topicProgresses };
    },
    ['dashboard-active-chapter'],
    { tags: ['student-progress'] }
);

export const getCachedAssignedBooks = unstable_cache(
    async (userId: number, schoolId: number) => {

        const userClassSubjects = await prisma.userClassSubject.findMany({
            where: { user_id: userId },
            include: {
                class_subject: {
                    include: {
                        subject: true,
                        books: {
                            include: {
                                chapters: {
                                    include: { topics: true }
                                }
                            }
                        }
                    }
                }
            }
        });


        const allProgress = await prisma.studentTopicProgress.findMany({
            where: { student_id: userId }
        });

        return { userClassSubjects, allProgress };
    },
    ['dashboard-assigned-books'],
    { tags: ['student-progress'] }
);

export const getCachedNextTopics = unstable_cache(
    async (userId: number, schoolId: number) => {

        return await prisma.studentTopicProgress.findMany({
            where: {
                student_id: userId,
                accuracy: { lt: 0.8 }
            },
            orderBy: { last_activity_at: 'desc' },
            take: 3,
            include: {
                topic: {
                    include: {
                        chapter: { include: { book: { include: { class_subject: { include: { subject: true } } } } } }
                    }
                }
            }
        });
    },
    ['dashboard-next-topics'],
    { tags: ['student-progress'] }
);
