"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import JsonRenderer from "./JsonRendered";
import { Check } from "lucide-react";
import { Option, QuestionType } from "@/app/generated/prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { JSONContent } from "@tiptap/core";

interface Props {
  questionId: string;
  questionType: QuestionType;
  options: Option[];
  explanation: JsonValue;
  savedAnswer?: {
    selectedIds: string[];
    isCorrect: boolean;
    submitted: boolean;
  };
  onSubmitAnswer: (questionId: string, selectedIds: string[], isCorrect: boolean) => void;
  onShowExplanation: () => void;
}

export default function OptionsList({
  questionId,
  questionType,
  options,
  savedAnswer,
  onSubmitAnswer,
  onShowExplanation,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [useSingleCol, setUseSingleCol] = useState(false);

  // Restore saved state when revisiting question
  useEffect(() => {
    function restore(savedAnswer: { selectedIds: string[]; submitted: boolean } | undefined) {
      if (savedAnswer) {
        setSelectedIds(savedAnswer.selectedIds);
        setSubmitted(savedAnswer.submitted);
      } else {
        setSelectedIds([]);
        setSubmitted(false);
      }
    }
    restore(savedAnswer)
  }, [savedAnswer, questionId]);

  // finding whether option content grows over single line string lenght
  useEffect(() => {
    const hasOverflow = buttonRefs.current.some((btn) => {
      if (!btn) return;
      const span = btn.querySelector("span");
      if (!span) return false;
      const lineHeight = parseFloat(getComputedStyle(span).lineHeight);
      return span.scrollHeight > lineHeight * 2.5;
    });
    setUseSingleCol(hasOverflow);
  }, [options]);

  const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id);

  const handleSelect = (option: Option) => {
    if (submitted) return;

    if (questionType === "MCQ" || questionType === "TRUE_FALSE") {
      const selected = [option.id];
      const isCorrect = correctIds.includes(option.id);

      setSelectedIds(selected);
      setSubmitted(true);

      onSubmitAnswer(questionId, selected, isCorrect);
      return;
    }

    if (questionType === "MSQ") {
      setSelectedIds((prev) =>
        prev.includes(option.id) ? prev.filter((id) => id !== option.id) : [...prev, option.id],
      );
    }
  };

  const handleSubmit = () => {
    if (submitted) return;

    const isCorrect =
      selectedIds.length === correctIds.length &&
      selectedIds.every((id) => correctIds.includes(id));

    setSubmitted(true);
    onSubmitAnswer(questionId, selectedIds, isCorrect);
  };

  return (
    <div className="space-y-4">
      <div
        className={clsx(
          "grid gap-4 grid-cols-1",
          useSingleCol ? "lg:grid-cols-1" : "lg:grid-cols-2",
        )}
      >
        {options.map((option, index) => {
          const isSelected = selectedIds.includes(option.id);
          const isCorrect = option.isCorrect;

          return (
            <button
              key={option.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              onClick={() => handleSelect(option)}
              disabled={submitted && questionType !== "MSQ"}
              className={clsx(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 border-b-4 active:translate-y-1 active:transition-transform active:duration-75",
                "border-gray-300 cursor-pointer",

                // base (only before submit)
                !submitted && "border-gray-300 bg-white hover:bg-gray-50",

                questionType === "MSQ" &&
                  !submitted &&
                  isSelected &&
                  "border-gray-500 ring-1 ring-gray-400",

                submitted &&
                  isSelected &&
                  !isCorrect &&
                  "bg-red-600 text-white border-red-500 border-b-red-800",

                submitted &&
                  isCorrect &&
                  "bg-green-600 text-white border-green-600 !border-b-green-800",
              )}
            >
              <span className="flex items-center gap-2 font-medium w-full [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1">
                {String.fromCharCode(65 + index)}.
                <JsonRenderer content={option.content as JSONContent} />
              </span>

              {submitted && isCorrect && (
                // <span className="text-white font-bold">✓</span>
                <span className="text-white font-bold">
                  <Check size={20} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {questionType === "MSQ" && !submitted && (
        <button
          onClick={handleSubmit}
          disabled={selectedIds.length === 0}
          className="mt-4 px-5 py-2 bg-[#7C31F6] text-white rounded-lg disabled:opacity-50 cursor-pointer border-b-4 border-b-[#5c25b4] active:translate-y-1 active:transition-transform active:duration-75 transition-all"
        >
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className="">
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={onShowExplanation}
              className={`cursor-pointer mt-3 px-5 py-2 rounded-lg font-medium border-b-4 transition-colors active:translate-y-1 active:transition-transform active:duration-75 ${
                savedAnswer?.isCorrect
                  ? "bg-green-600 text-white border-b-green-700 hover:bg-green-700"
                  : "bg-red-600 text-white border-b-red-700 hover:bg-red-700"
              }`}
            >
              View Explanation
            </button>
            <h3
              className={`font-semibold mt-3 px-5 py-2 bg-gray-200 rounded-lg ${savedAnswer?.isCorrect ? "!text-green-600" : "text-red-500"}`}
            >
              {savedAnswer?.isCorrect ? "Correct Answer!" : "Wrong Answer!"}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
