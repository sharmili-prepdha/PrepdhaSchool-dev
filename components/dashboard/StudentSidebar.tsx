"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChalkboardUser,
    faBookOpenReader,
    faCircleQuestion,
    faComments,
    faTrophy,
    faChartSimple
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/student', icon: faChalkboardUser },
    { name: 'Learn', href: '/student/syllabus', icon: faBookOpenReader, activePrefix: '/student/syllabus' },
    { name: 'Quizmaster', href: '/student/quizmaster', icon: faCircleQuestion },
    { name: 'Chat Hub', href: '/student/chat', icon: faComments },
    { name: 'Leaderboard', href: '/student/leaderboard', icon: faTrophy },
    { name: 'Analytics', href: '/student/analytics', icon: faChartSimple },
];

export function StudentSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 z-40">
            {NAV_ITEMS.map((item) => {
                const isActive = item.activePrefix
                    ? pathname?.startsWith(item.activePrefix)
                    : pathname === item.href;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                            isActive
                                ? "bg-[#6c3df5] text-white shadow-sm shadow-[#6c3df5]/20"
                                : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                        )}
                    >
                        <FontAwesomeIcon
                            icon={item.icon}
                            className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")}
                        />
                        {item.name}
                    </Link>
                );
            })}
        </aside>
    );
}
