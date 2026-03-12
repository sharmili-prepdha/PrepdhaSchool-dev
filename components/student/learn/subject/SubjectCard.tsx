import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SubjectCardProps {
    title: string;
    status: "AT RISK" | "ON TRACK";
    progress: number;
    image: string;
    lastSeen: string;
    href: string;
}

export function SubjectCard({ title, status, progress, image, lastSeen, href }: SubjectCardProps) {
    return (
        <Link href={href} className="block group">
            <Card className="bg-white rounded-3xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-black/20 backdrop-blur-md text-white border-0 text-[10px] font-bold py-1 px-2 rounded-lg">
                            {lastSeen}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            status === "AT RISK" ? "text-[#FF4D4D]" : "text-[#00BB79]"
                        )}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-800 truncate">{title}</h3>

                        <div className="relative w-12 h-12 shrink-0">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-muted/20"
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 20}
                                    strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                                    className={cn(
                                        "transition-all duration-500",
                                        status === "AT RISK" ? "text-[#FF4D4D]" : "text-[#00BB79]"
                                    )}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {progress}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
