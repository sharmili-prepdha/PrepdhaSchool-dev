"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpen,
    faSearch,
    faInfoCircle,
    faShield,
    faFlag,
    faHandshake,
    faCrown,
    faGavel,
    faFistRaised,
    faPen,
    faBolt,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/core-input';
import { Badge } from '@/components/ui/core-badge';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type TopicProgress = 'not_started' | 'in_progress' | 'completed';

export type Topic = {
    id: number;
    title: string;
    progress: TopicProgress;
    progressPercent?: number; // 0-100
};

export type Chapter = {
    id: number;
    title: string;
    topics: Topic[];
};

type Props = {
    chapters: Chapter[];
    activeTopicId?: number;
};

function renderTopicProgress(topic: Topic) {
    if (topic.progress === 'not_started') {
        return (
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                Not Started
            </Badge>
        );
    }

    if (topic.progress === 'completed') {
        return (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                Completed
            </Badge>
        );
    }

    // In progress
    const percent = topic.progressPercent ?? 0;
    return (
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00b87c] rounded-full" style={{ width: `${percent}% ` }} />
        </div>
    );
}

export function LeftPanel({ chapters, activeTopicId }: Props) {
    const [expandedChapterId, setExpandedChapterId] = useState<number | null>(
        chapters.find(c => c.topics.some(t => t.id === activeTopicId))?.id ?? chapters[0]?.id ?? null
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTopicClick = (topicId: number) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        router.push(`/student/learn/learning/${topicId}?${params.toString()}`);
    };

    return (
        <div className="w-[320px] shrink-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
                className={cn(
                    "bg-slate-50 p-5 flex flex-col gap-4 cursor-pointer hover:bg-slate-100 transition-colors",
                    isSidebarOpen && "border-b border-slate-100"
                )}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <div className="flex items-center justify-between text-slate-600 font-bold text-lg">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5 text-slate-500" />
                        Chapters
                    </div>

                </div>
                {isSidebarOpen && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search within this chapter"
                            className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-lg text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-purple-600 focus-visible:border-purple-600 font-medium"
                        />
                    </div>
                )}
            </div>

            {isSidebarOpen && (
                <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                    {chapters.map((chapter, index) => {
                        const isExpanded = expandedChapterId === chapter.id;
                        const hasActiveTopic = chapter.topics.some(t => t.id === activeTopicId);

                        return (
                            <div key={chapter.id} className="flex flex-col gap-2">
                                <div
                                    onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-colors shadow-sm",
                                        isExpanded
                                            ? "bg-purple-100/50 border border-purple-300 text-purple-600 hover:bg-purple-100"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 pr-2">
                                        <FontAwesomeIcon icon={isExpanded ? faShield : faBookOpen} className={cn("w-4 h-4 shrink-0 mt-0.5", isExpanded ? "" : "text-slate-500")} />
                                        <span className="font-bold text-sm leading-snug">{chapter.title}</span>
                                    </div>

                                </div>

                                {isExpanded && chapter.topics.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mt-1 mb-2">
                                        {chapter.topics.map(topic => {
                                            const isActive = topic.id === activeTopicId;

                                            return (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => handleTopicClick(topic.id)}
                                                    className={cn(
                                                        "flex flex-col gap-3 p-4 rounded-[14px] border cursor-pointer transition-colors min-h-[140px]",
                                                        isActive
                                                            ? "border-purple-400 bg-purple-50/30 hover:bg-purple-50"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        isActive ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        <FontAwesomeIcon icon={isActive ? faFlag : faBolt} className="w-4 h-4" />
                                                    </div>
                                                    <div className={cn(
                                                        "font-bold text-[13px] leading-snug",
                                                        isActive ? "text-purple-600" : "text-slate-600"
                                                    )}>
                                                        {topic.title}
                                                    </div>
                                                    <div className="mt-auto">
                                                        {renderTopicProgress(topic)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
