import { Card } from "@/components/ui/card";

interface TrophiesPanelProps {
  totalXp: number;
}

const TROPHY_LEVELS = [
  { level: 1, title: "Beginner Explorer", requiredXp: 0 },
  { level: 2, title: "Knowledge Seeker", requiredXp: 200 },
  { level: 3, title: "Smart Learner", requiredXp: 500 },
  { level: 4, title: "Rising Scholar", requiredXp: 1000 },
  { level: 5, title: "Concept Master", requiredXp: 2000 },
  { level: 6, title: "Academic Warrior", requiredXp: 3500 },
  { level: 7, title: "School Topper", requiredXp: 5000 },
  { level: 8, title: "Elite Performer", requiredXp: 8000 },
  { level: 9, title: "Future Achiever", requiredXp: 12000 },
  { level: 10, title: "Legend Scholar", requiredXp: 20000 },
];

export function TrophiesPanel({ totalXp }: TrophiesPanelProps) {
  const getCurrentLevel = (xp: number) => {
    let currentLevel = TROPHY_LEVELS[0];
    let nextLevel = TROPHY_LEVELS[1];

    for (let i = 0; i < TROPHY_LEVELS.length; i++) {
      if (xp >= TROPHY_LEVELS[i].requiredXp) {
        currentLevel = TROPHY_LEVELS[i];
        nextLevel = TROPHY_LEVELS[i + 1] || TROPHY_LEVELS[i];
      }
    }

    const xpNeededForNext = nextLevel.requiredXp - xp;

    return {
      currentLevel,
      nextLevel,
      xpNeededForNext: Math.max(0, xpNeededForNext),
      isMaxLevel: currentLevel.level === TROPHY_LEVELS.length,
    };
  };

  const { currentLevel, nextLevel, xpNeededForNext, isMaxLevel } = getCurrentLevel(totalXp);

  return (
    <Card className="flex sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-2xl border border-b-8 border-gray-200 shadow-sm w-full min-w-0 h-full">
      <div className="flex flex-col items-start gap-2 sm:gap-3 mb-4 sm:mb-0 flex-1 w-full min-h-0">
        {/* Icon Space - Hidden on smaller screens */}
        <div className="flex gap-2">
        <div className="shrink-0 hidden lg:flex lg:items-center lg:justify-center">
          <div className="w-10 lg:w-8 h-10 lg:h-8 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            {/* Space for icon/image */}
          </div>
        </div>

        {/* Title and Level Info */}
        <div className="flex-1 w-full min-h-0">
          <span className="text-xs font-semibold text-gray-500 line-clamp-1 block">
            LEVEL {currentLevel.level}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight line-clamp-1 -mt-0.5">
            {currentLevel.title}
          </h3>

          {isMaxLevel && (
            <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded px-1.5 py-1 border border-yellow-200 mt-1">
              <p className="text-xs font-semibold text-gray-800">🏆 Max!</p>
            </div>
          )}
        </div>
        </div>
        {!isMaxLevel && (
          <div className="flex bg-gray-50 rounded px-1.5  text-xs leading-tight w-full gap-4 items-center">
            <p className="text-gray-600 line-clamp-1 truncate">{nextLevel.title} </p>
            <p className="text-orange-500 font-semibold">{xpNeededForNext} XP</p>
          </div>
        )}
      </div>
    </Card>
  );
}
