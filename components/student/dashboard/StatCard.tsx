import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  borderColorClass: string;
  valueColorClass: string;
  variant?: "first" | "default";
}

export function StatCard({
  icon,
  value,
  label,
  borderColorClass,
  valueColorClass,
  variant = "default",
}: StatCardProps) {
  const isFirst = variant === "first";

  return (
    <Card
      className={cn(
        "p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-b-8 shadow-none bg-white flex-1",
        borderColorClass,
        isFirst ? "flex flex-row items-center gap-3 sm:gap-2" : "flex flex-col gap-2",
      )}
    >
      <div
        className={cn(
          "w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 flex items-center justify-center shrink-0",
          !isFirst,
        )}
      >
        {icon}
      </div>

      <div className={cn(!isFirst && "flex flex-col", "gap-1")}>
        <h2 className={cn("text-xl sm:text-2xl md:text-3xl font-extrabold", valueColorClass)}>
          {value}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-400 font-medium">{label}</p>
      </div>
    </Card>
  );
}
