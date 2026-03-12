'use client'
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

interface TopicCardProps {
    subject: string;
    chapter: string;
    topic: string;
    title: string;
    tags: string[];
    gradient: string;
    icon: string;
    xp: number;
    topicId: number;
}

export function TopicCard({ subject, chapter, topic, title, tags, gradient, icon, xp, topicId }: TopicCardProps) {
    const router = useRouter();
    return (
        <Card
            className="flex items-center p-4 rounded-3xl border-none shadow-sm hover:shadow-md transition-all duration-200 group gap-6 cursor-pointer"
            onClick={() => router.push(`/student/learn/learning/${topicId}`)}
        >
            <div className={cn(
                "w-32 h-32 rounded-2xl flex items-center justify-center text-5xl shrink-0 transition-transform duration-300 group-hover:scale-105",
                gradient
            )}>
                {icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em] mb-1">
                    {subject} • {chapter} • {topic}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 truncate leading-tight group-hover:text-[#7C31F6] transition-colors">{title}</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className={cn(
                            "bg-neutral-100 hover:bg-neutral-200 text-neutral-500 border-none rounded-lg px-3 py-1 text-[10px] font-bold uppercase",
                            idx === 0 && tag === "Intermediate" && "bg-orange-100 text-orange-500",
                            idx === 0 && tag === "Beginner" && "bg-emerald-100 text-emerald-500"
                        )}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <Button variant="default" className="px-8 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-1 bg-[#7C31F6] text-white hover:bg-[#6c28d9]">
                Start - {xp} XP
            </Button>
        </Card>
    );
}
