import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakPanelProps {
  currentStreak?: number;
  lastActiveDate?: Date | null;
}

export function StreakPanel({ currentStreak = 0, lastActiveDate }: StreakPanelProps) {
  // Generate the last 7 days
  const generateDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    const dayLabels = ["M", "T", "W", "Th", "F", "Sa", "Su"];

    // Determine the start date for streak (how many days back the last active date should count)
    let lastActiveDateObj: Date | null = null;
    if (lastActiveDate) {
      lastActiveDateObj = new Date(lastActiveDate);
      lastActiveDateObj.setHours(0, 0, 0, 0);
    }

    // Calculate which days are part of the streak
    const streakEndDate = lastActiveDateObj ? new Date(lastActiveDateObj) : null;
    const streakStartDate = streakEndDate
      ? new Date(streakEndDate.getTime() - (currentStreak - 1) * 24 * 60 * 60 * 1000)
      : null;

    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - i);

      let status: "completed" | "missed" | "upcoming" = "upcoming";

      if (currentDate > today) {
        status = "upcoming";
      } else if (streakStartDate && streakEndDate) {
        if (currentDate >= streakStartDate && currentDate <= streakEndDate) {
          status = "completed";
        } else {
          status = "missed";
        }
      } else if (currentDate < today) {
        status = "missed";
      }

      days.push({
        label: dayLabels[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1],
        status,
      });
    }

    return days;
  };

  const days = generateDays();

  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-7 rounded-2xl border border-b-8 border-gray-200 shadow-sm w-full h-full">
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-0 flex-1">
        <Flame className="w-6 sm:w-8 h-6 sm:h-8 text-orange-500 fill-orange-500 mt-0 sm:mt-1 shrink-0" />
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700">
            {currentStreak} days streak
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
            Keep going! You are doing great.
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold 
              ${
                day.status === "completed"
                  ? "bg-[#8b3dff] text-white"
                  : day.status === "missed"
                    ? "border-2 border-dashed border-gray-200 text-gray-300"
                    : "border-2 border-[#8b3dff] text-[#8b3dff]"
              }`}
          >
            {day.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
