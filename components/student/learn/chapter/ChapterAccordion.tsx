"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faCheckCircle,
    faPen,
} from '@fortawesome/free-solid-svg-icons';

export function ChapterAccordion({ chapter }: { chapter: any }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(
        chapter.topics.some((t: any) => t.progressStatus === 'in_progress')
    );

    const totalTopics = chapter.topics.length;
    const completedTopics = chapter.topics.filter((t: any) => t.progressStatus === 'completed').length;
    const isFullyCompleted = totalTopics > 0 && completedTopics === totalTopics;

    return (
        <div className={cn(
            "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
            isOpen ? "border-slate-300 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300"
        )}>
            {/* Accordion Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-5 cursor-pointer select-none"
            >
                <div className="flex items-center gap-4">
                    {!isOpen && (
                        <div className="flex items-center justify-center shrink-0 w-6 h-6">
                            {isFullyCompleted
                                ? <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 w-5 h-5" />
                                : <div className="bg-blue-50 p-1.5 rounded-md"><FontAwesomeIcon icon={faPen} className="text-blue-500 w-3 h-3" /></div>
                            }
                        </div>
                    )}

                    {isOpen && (
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl border border-blue-100 shrink-0">
                            📚
                        </div>
                    )}

                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider mb-0.5 text-slate-500">
                            Chapter {String(chapter.order_no || chapter.id).padStart(2, '0')}
                        </span>
                        <span className={cn(
                            "font-bold",
                            isOpen ? "text-lg text-slate-900" : "text-sm text-slate-700"
                        )}>
                            {chapter.title}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isOpen && !isFullyCompleted && (
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
                            Continue
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400">
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* Accordion Body */}
            {isOpen && (
                <div className="px-5 pb-5 pt-2">
                    <div className="flex flex-col gap-2">
                        {chapter.topics.map((topic: any) => (
                            <div
                                key={topic.id}
                                onClick={() => router.push(`/student/learn/learning/${topic.id}`)}
                                className={cn(
                                    "flex items-center justify-between p-3.5 rounded-xl border transition-colors cursor-pointer hover:border-purple-300",
                                    topic.progressStatus === 'completed' ? "bg-emerald-50/30 border-emerald-100" :
                                        topic.progressStatus === 'in_progress' ? "bg-white border-slate-200 shadow-sm" :
                                            "bg-white border-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Topic Status Icon */}
                                    <div className="flex items-center justify-center shrink-0 w-6 h-6">
                                        {topic.progressStatus === 'completed' && (
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 w-5 h-5" />
                                        )}
                                        {topic.progressStatus === 'in_progress' && (
                                            <div className="relative w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm">
                                                <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 36 36">
                                                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                    <path className="text-emerald-500" strokeDasharray={`${topic.progressPercent}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                </svg>
                                                <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5 text-slate-700 relative z-10" />
                                            </div>
                                        )}
                                        {topic.progressStatus === 'not_started' && (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                                        )}
                                    </div>

                                    <span className="text-sm font-bold text-slate-800">
                                        {topic.title}
                                    </span>
                                </div>

                                {/* Action Button */}
                                <div>
                                    {topic.progressStatus === 'completed' && (
                                        <div className="px-4 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 font-bold text-xs bg-white hover:bg-emerald-50 transition-colors inline-block">
                                            Revise
                                        </div>
                                    )}
                                    {topic.progressStatus === 'in_progress' && (
                                        <div className="px-4 py-1.5 rounded-lg border border-purple-200 text-purple-600 font-bold text-xs bg-white hover:bg-purple-50 transition-colors inline-block shadow-sm">
                                            Continue
                                        </div>
                                    )}
                                    {topic.progressStatus === 'not_started' && (
                                        <div className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-500 font-bold text-xs bg-white hover:bg-slate-50 transition-colors inline-block">
                                            Start
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
