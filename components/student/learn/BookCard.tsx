import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BookCardProps {
  id: number;
  title: string;
  subjectName: string;
  progress: number;
  status: "ON_TRACK" | "AT_RISK";
  imageUrl: string;
}

export function BookCard({
  id,
  title,
  subjectName,
  progress,
  status,
  imageUrl
}: BookCardProps) {
  const statusLabel = status === "ON_TRACK" ? "ON TRACK" : "AT RISK";
  const isOnTrack = status === "ON_TRACK";

  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference * (1 - clampedProgress / 100);

  return (
    <Link href={`/student/learn/learning?bookId=${id}`} className="block">
      <Card className="relative w-full h-[280px] rounded-xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
        <div className="h-[180px] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover rounded-t-xl"
          />
        </div>

        <CardContent className="relative p-[16px] space-y-[8px] h-[100px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              {subjectName}
            </span>
            <span className="text-muted-foreground">•</span>
            <Badge
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full border-0",
                isOnTrack ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              )}
            >
              {statusLabel}
            </Badge>
          </div>

          <h3 className="text-[16px] font-semibold text-gray-900 line-clamp-2 pr-16">
            {title}
          </h3>

          <div className="absolute bottom-[16px] right-[16px] w-[48px] h-[48px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-muted/20"
              />
              <circle
                cx="28"
                cy="28"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-500",
                  isOnTrack ? "text-emerald-500" : "text-red-500"
                )}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
              {clampedProgress}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

