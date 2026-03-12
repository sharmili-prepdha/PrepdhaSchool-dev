"use client";

import { Zap, ArrowRightCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/core-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JumpBackCardProps {
    subject: string;
    chapter: string;
    title: string;
    progress: number;
    xp: number;
    icon?: React.ReactNode;
    iconBg: string;
    color: string;
    progressColor?: string;
    topicId: number;
    imageUrl?: string;
}

export function JumpBackCard({ subject, chapter, title, progress, xp, icon, iconBg, color, progressColor, topicId, imageUrl }: JumpBackCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTopicClick = () => {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        router.push(`/student/learn/learning/${topicId}?${params.toString()}`);
    };

    return (
        <Card
            className="bg-white rounded-2xl border-none shadow-sm h-full flex flex-col overflow-hidden group transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={handleTopicClick}
        >
            <CardContent className="p-6 pb-4 flex-1">
                <div className="flex items-start gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden", iconBg)}>
                        {imageUrl ? (
                            <img src={imageUrl} alt={subject} className="w-full h-full object-cover" />
                        ) : (
                            icon
                        )}
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            {subject} • {chapter}
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                            {title}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <Progress value={progress} className={cn("h-2 flex-1 bg-muted", progressColor)} />
                    <div className="flex items-center gap-1 text-[#3B82F6] font-bold text-xs whitespace-nowrap">
                        <Zap className="w-3 h-3 fill-current" />
                        {xp} XP
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-0">
                <Button
                    type="button"
                    variant="default"
                    className="w-full h-12 rounded-none flex items-center justify-between px-6 transition-all duration-200 group-hover:px-4 bg-[#7C31F6] text-white hover:bg-[#6c28d9]"
                    onClick={handleTopicClick}
                >
                    <span className="font-semibold">Continue</span>
                    <ArrowRightCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </Button>
            </CardFooter>
        </Card>
    );
}
