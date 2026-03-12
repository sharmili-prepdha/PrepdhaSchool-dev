import { ReactNode } from 'react';

import { getAuthUser } from '@/lib/auth/auth';
import { getCachedUserSessionData } from '@/lib/students/global';

export default async function StudentLayout({ children }: { children: ReactNode }) {
    const session = await getAuthUser();
    let totalXp = 0;
    let name = "Student";

    if (session) {
        const data = await getCachedUserSessionData(session.userId, session.schoolId);
        name = data.name;
        totalXp = data.totalXp;
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50 font-[family-name:var(--font-outfit)] text-slate-900 flex flex-col">
            <main className="flex-1 bg-slate-50/50">
                {children}
            </main>
        </div>
    );
}
