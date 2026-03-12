import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedUserSessionData = unstable_cache(
    async (userId: number, schoolId: number) => {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const gamificationState = await prisma.studentGamificationState.findUnique({
            where: { student_id: userId }
        });

        return {
            name: user?.name || "Student",
            totalXp: gamificationState?.total_xp || 0
        };
    },
    ['global-user-session'],
    { tags: ['student-global'] }
);
