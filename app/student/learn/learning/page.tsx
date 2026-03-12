import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/auth';
import { getCachedInitialLearningRoute } from '@/lib/students/learning-engine';

export default async function LearningRootPage() {
    const session = await getAuthUser();
    if (!session) redirect('/login');

    const route = await getCachedInitialLearningRoute(session.userId, session.schoolId);

    if (route) {
        redirect(`/student/learn/learning/${route.topicId}`);
    } else {
        return <div className="p-8 text-center text-slate-500 font-medium text-lg">No content available.</div>;
    }
}
