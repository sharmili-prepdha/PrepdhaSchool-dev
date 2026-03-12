"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getRandomMessageIndex } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

import type { RevisionTopic } from "@/features/student/actions/student.action";
import Link from "next/link";

interface TodayRevisionsProps {
  revisions: RevisionTopic[];
}

const appreciationMessages = [
  "🎉 Amazing! You've completed all today's revisions!",
  "✨ Fantastic work! No more revisions for today!",
  "🌟 Great job! You're all caught up!",
  "🚀 Awesome! You've conquered today's goals!",
  "💪 Excellent effort! Rest and recharge!",
];

export function TodayRevisions({ revisions }: TodayRevisionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Compute sorted revisions and appreciation index during render
  const { sortedRevisions, appreciationIndex } = useMemo(() => {
    // Only sort and select random message when array actually changes
    const sorted = [...(revisions || [])].sort((a, b) => a.revision_counter - b.revision_counter);
    const idx = getRandomMessageIndex(
      appreciationMessages.length,
      Array.isArray(revisions) ? revisions.length : 0,
    );
    return { sortedRevisions: sorted, appreciationIndex: idx };
  }, [revisions]);

  if (!Array.isArray(revisions) || sortedRevisions.length === 0) {
    return (
      <div className="relative w-full flex items-center justify-center min-h-64 h-full">
        <Card className="relative p-8 rounded-3xl border border-b-8 border-gray-200 shadow-sm flex flex-col bg-linear-to-br from-yellow-50 to-orange-50 z-10 text-center w-full h-full justify-center">
          <p className="text-2xl font-bold text-gray-800 mb-2">
            {appreciationMessages[appreciationIndex]}
          </p>
          <p className="text-sm font-medium text-gray-600">
            Great job keeping up with your revision schedule!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-56 sm:min-h-64 md:min-h-72 flex flex-col justify-center">
      {/* Card Stack */}
      <div className="relative w-full z-10 min-h-52 sm:min-h-60 md:min-h-64">
        <AnimatePresence mode="popLayout">
          {sortedRevisions.map((rev, index) => {
            // How far is this card from the current one in the stack
            const diff = (index - currentIndex + sortedRevisions.length) % sortedRevisions.length;

            // Only render up to 3 cards for the stack effect
            if (diff > 2 && sortedRevisions.length > 3) return null;

            const isCurrent = diff === 0;

            return (
              <motion.div
                key={rev.id || index}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{
                  opacity: 1 - diff * 0.15,
                  y: diff * 10,
                  scale: 1 - diff * 0.04,
                  zIndex: 10 - diff,
                }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={isCurrent ? "relative w-full" : "absolute top-0 left-0 w-full"}
                style={{
                  pointerEvents: isCurrent ? "auto" : "none",
                }}
              >
                <Card
                  className={`relative p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-b-8 border-gray-200 shadow-lg flex flex-col ${diff === 0 ? "bg-white" : diff === 1 ? "bg-gray-50" : "bg-gray-100"}`}
                >
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Revise today</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 line-clamp-2 h-14 sm:h-16">
                    {rev.topic?.title || "Topic"}
                  </h3>

                  <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 flex-1">
                    <div className="flex justify-between text-xs sm:text-sm gap-2 flex-wrap">
                      <span className="text-gray-400 font-semibold">
                        Number of Times Revised: {rev.revision_counter || 0}
                      </span>
                      <span className="text-gray-400 font-semibold text-right">
                        Last Revised on: {formatDate(new Date(rev.next_revision_at))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-auto">
                    <Link href={`/student/learning/${rev.topic?.id}`}>
                      <Button
                        variant="outline"
                        className="border-2 border-[#8b3dff] text-[#8b3dff] rounded-xl sm:rounded-2xl font-bold px-3 sm:px-4 py-2 sm:py-6 text-xs sm:text-base bg-white shadow-none hover:bg-purple-50 border-b-4 flex-1 w-full transition-all cursor-pointer"
                        tabIndex={isCurrent ? 0 : -1}
                      >
                        Let&apos;s Revise
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {sortedRevisions.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 z-20">
          {sortedRevisions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-5 sm:w-6 h-2 bg-[#8b3dff]"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
