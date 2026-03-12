import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Lock, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChapterStep {
    id: number;
    title: string;
    status: "completed" | "current" | "locked";
}

interface KeepLearningCardProps {
    title: string;
    subtitle: string;
    steps: ChapterStep[];
}

export function KeepLearningCard({ title, subtitle, steps }: KeepLearningCardProps) {
    // Calculate completed percentage for the connector line
    const completedCount = steps.filter(s => s.status === "completed").length;
    const progressPercent = (completedCount / Math.max(steps.length - 1, 1)) * 100;

    return (
        <Card className="bg-[#F6F3FF] border-none rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-start justify-between mb-12">
                <div>
                    <Badge className="bg-[#7C31F6] hover:bg-[#7C31F6] text-white rounded-lg px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider">
                        Current Module <span className="ml-1 opacity-50">▾</span>
                    </Badge>
                    <h2 className="text-3xl font-bold text-[#7C31F6] mb-2 font-outfit truncate max-w-md">{title}</h2>
                    <p className="text-[#7C31F6]/60 text-sm font-medium">{subtitle}</p>
                </div>
                <Button variant="secondary" className="px-8 h-12 rounded-xl flex items-center gap-2 group transition-all duration-200">
                    Continue
                    <MoveRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
            </div>

            <div className="relative mt-8">
                {/* Connector Line */}
                <div className="absolute top-10 left-[4%] right-[4%] h-2 bg-white/50 rounded-full z-0 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-[#00BB79] rounded-full shadow-sm transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="flex justify-between items-start relative z-10 px-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center gap-4 w-40">
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center border-8 border-[#F6F3FF] shadow-sm transition-all duration-200",
                                step.status === "completed" ? "bg-[#00BB79] scale-100" :
                                    step.status === "current" ? "bg-[#7C31F6] scale-110 shadow-lg shadow-primary/20" :
                                        "bg-white"
                            )}>
                                {step.status === "completed" && <Check className="w-8 h-8 text-white stroke-[3px]" />}
                                {step.status === "current" && <Star className="w-8 h-8 text-white fill-white" />}
                                {step.status === "locked" && <Lock className="w-8 h-8 text-neutral-300" />}
                            </div>
                            <div className={cn(
                                "text-center text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all duration-200 line-clamp-2 min-h-[32px] flex items-center justify-center",
                                step.status === "completed" ? "bg-[#E7F9F2] text-[#00BB79] border-[#00BB79]/20" :
                                    step.status === "current" ? "bg-[#EEF2FF] text-[#7C31F6] border-[#7C31F6]/20" :
                                        "bg-white text-neutral-400 border-neutral-100"
                            )}>
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
