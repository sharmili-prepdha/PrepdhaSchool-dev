"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ReviewQuality } from "@/app/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { calculateNextIntervalByRating, formatInterval } from "@/lib/srs";

export type ReviewOption = {
  label: string;
  value: ReviewQuality;
  className?: string;
};

type ReviewButtonsProps = {
  onSelect: (value: ReviewOption["value"]) => void;
  currentInterval: number;
  disabled: boolean;
};

const reviewOptions: ReviewOption[] = [
  { label: "Again", value: "again", className: "border-red-400 bg-red-200 hover:bg-red-100 text-gray-600" },
  { label: "Hard", value: "hard", className: "border-yellow-400 bg-yellow-200 hover:bg-yellow-100 text-gray-600" },
  { label: "Good", value: "good", className: "border-green-400 bg-green-200 hover:bg-green-100 text-gray-600" },
  { label: "Easy", value: "easy", className: "border-violet-400 bg-violet-500 hover:bg-violet-100 text-white" },
];

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({ onSelect, currentInterval, disabled }) => {
  const showInterval = (currentInterval: number, rating: ReviewQuality) => {
    const newInterval = calculateNextIntervalByRating(currentInterval, rating)?.newInterval ?? 1;
    return formatInterval(newInterval * 1000);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {reviewOptions.map((option, index) => (
        <Button
          key={index}
          variant="elevated"
          className={cn(
            "h-[86px] w-full rounded-xl font-semibold text-base transition-all",
            "active:scale-95 disabled:cursor-not-allowed",
            option.className
          )}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-1">
            <span>{option.label}</span>
            <span className="text-sm font-normal opacity-70">
              {showInterval(currentInterval, option.value)}
            </span>
          </div>
        </Button>
      ))}
    </div>
  );
};
