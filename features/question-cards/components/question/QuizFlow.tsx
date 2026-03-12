"use client";

import { useEffect, useState, useCallback } from "react";
import QuestionCard from "./QuestionCard";
import { getQuestionsByTopicId } from "@/features/question-cards/actions/questoin.actions";
import { saveQuizAccuracy } from "@/features/question-cards/actions/progress.actions";
import { shuffleArray } from "./utils/shuffleArray";
import { useQuizPersistence } from "./hooks/useQuizPersistence";
import JsonRenderer from "./JsonRendered";
import { X, Trophy, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { QuestionWithOptions } from "../../types/questions";
import { JSONContent } from "@tiptap/core";

type QuizStatus = "IDLE" | "IN_PROGRESS" | "FINISHED" | "SUBMITTED";

interface AnswerState {
  selectedIds: string[];
  isCorrect: boolean;
  submitted: boolean;
}

interface Props {
  topicId: number;
  studentId: number; // pass from session/auth
  schoolId?: number;
}

export default function QuizFlow({ topicId, studentId }: Props) {
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>("IDLE");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionIds, setQuestionIds] = useState<string[]>([]); // Track question order

  const { saveProgress, restoreProgress, clearProgress } = useQuizPersistence(topicId);

  // ── Fetch questions ──────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError(null); // Clear previous errors
        const data: QuestionWithOptions[] = await getQuestionsByTopicId(topicId);
        if (!mounted) return;

        const shuffled = shuffleArray(data).map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }));
        const ids = shuffled.map((q) => q.id);

        setQuestions(shuffled);
        setQuestionIds(ids);
        setLoading(false);

        // Check for a saved snapshot to offer resume
        const snapshot = restoreProgress();
        // Show resume if user has made progress (answered questions OR navigated past question 0)
        if (snapshot && (Object.keys(snapshot.answers).length > 0 || snapshot.currentIndex > 0)) {
          // Reorder questions to match saved order to maintain quiz continuity
          const questionMap = Object.fromEntries(shuffled.map((q) => [q.id, q]));
          const reorderedQuestions = snapshot.questionIds.map((id) => questionMap[id]);
          setQuestions(reorderedQuestions);
          setQuestionIds(snapshot.questionIds);

          setResumeAvailable(true);
        } else {
          setStatus("IN_PROGRESS");
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load questions:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load questions. Please try again.",
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [topicId, restoreProgress]);

  // ── Persist on every answer change ──────────────────────────────────────
  useEffect(() => {
    if (status !== "IN_PROGRESS") return;
    saveProgress(currentIndex, answers, questionIds);
  }, [answers, currentIndex, status, questionIds, saveProgress]);

  // ── Reset explanation on question change ─────────────────────────────────
  useEffect(() => {
    setShowExplanation(false);
  }, [currentIndex]);

  // ── Resume handler ────────────────────────────────────────────────────────
  const handleResume = () => {
    const snapshot = restoreProgress();
    if (snapshot) {
      // Verify we have matching question data
      if (snapshot.questionIds.length === questions.length) {
        // Only reorder if we have the same questions
        const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));
        const reorderedQuestions = snapshot.questionIds.map((id) => questionMap[id]);
        setQuestions(reorderedQuestions);
        setQuestionIds(snapshot.questionIds);
      }
      setCurrentIndex(snapshot.currentIndex);
      setAnswers(snapshot.answers);
    }
    setResumeAvailable(false);
    setStatus("IN_PROGRESS");
  };

  const handleFresh = () => {
    clearProgress(); // Clear old quiz data immediately
    setAnswers({});
    setCurrentIndex(0);
    setResumeAvailable(false);
    setStatus("IN_PROGRESS");
    setError(null);
  };

  // ── Answer submit ─────────────────────────────────────────────────────────
  const handleAnswerSubmit = useCallback(
    (questionId: string, selectedIds: string[], isCorrect: boolean) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { selectedIds, isCorrect, submitted: true },
      }));
    },
    [],
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canGoNext = currentAnswer?.submitted;

  const handleNext = () => {
    if (!canGoNext) return;
    setDirection("next");
    if (currentIndex === questions.length - 1) {
      handleFinish();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setDirection("prev");
    setCurrentIndex((prev) => prev - 1);
  };

  // ── Finish & submit ────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setStatus("FINISHED");
    setError(null); // Clear previous errors

    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;

    setSubmitting(true);
    let retries = 0;
    const maxRetries = 3;

    const attemptSave = async (): Promise<boolean> => {
      try {
        await saveQuizAccuracy({
          studentId,
          topicId,
          correctCount,
          totalCount: questions.length,
        });
        return true;
      } catch (err) {
        retries++;
        const errorMessage = err instanceof Error ? err.message : "Failed to save quiz results";
        console.error(`Failed to save accuracy (attempt ${retries}/${maxRetries}):`, err);
        if (retries < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          return attemptSave();
        }
        // Set error on final failure
        setError(
          `Unable to save results: ${errorMessage}. Please check your connection and retry.`,
        );
        return false;
      }
    };

    const success = await attemptSave();
    if (success) {
      clearProgress(); // only clear after successful DB write
      setStatus("SUBMITTED");
    } else {
      // Keep the FINISHED status but show error - user can retry
      console.error("Unable to save quiz results after retries");
      setStatus("FINISHED");
    }
    setSubmitting(false);
  };

  // ── Restart ───────────────────────────────────────────────────────────────
  const handleRestart = () => {
    // Shuffle questions and options for fresh start
    const reshuffled = questions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setQuestions(reshuffled);

    // Reset all state
    setAnswers({});
    setCurrentIndex(0);
    setStatus("IN_PROGRESS");
    setShowExplanation(false);
    setError(null);

    // Clear localStorage to prevent stale data on refresh
    clearProgress();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Error Banner Component
  const ErrorBanner = () => (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top duration-300">
        <div className="flex items-start gap-3">
          <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div>Loading questions...</div>;
  if (!questions.length) return <div>No questions available.</div>;

  // Resume prompt
  if (resumeAvailable) {
    return (
      <>
        {error && <ErrorBanner />}
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Resume Quiz?</h2>
          <p className="text-gray-500 text-sm mb-6">
            You have an unfinished quiz for this topic. Would you like to continue where you left
            off?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-2 bg-[#7C31F6] text-white rounded-lg border-b-4 border-b-[#5c25b4] font-semibold cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all"
            >
              Resume
            </button>
            <button
              onClick={handleFresh}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg border-b-4 border-b-gray-300 font-semibold cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </>
    );
  }

  // Finish screen (FINISHED or SUBMITTED)
  if (status === "FINISHED" || status === "SUBMITTED") {
    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <>
        {error && <ErrorBanner />}
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in duration-300 border-b-5">
          <div className="flex items-center justify-center mb-6">
            <Trophy size={40} className="text-[#7C31F6]" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Quiz Completed</h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            {submitting
              ? "Saving your results..."
              : status === "SUBMITTED"
                ? "Results saved successfully ✓"
                : "Unable to save results to server — your progress is stored locally. Click Retry to save."}
          </p>

          {/* Score Section — same as existing finish screen */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 text-center">
            <div className="text-4xl font-bold text-[#7C31F6] mb-2">{percentage}%</div>
            <p
              className={`font-semibold text-sm ${isExcellent ? "text-green-600" : isGood ? "text-blue-600" : "text-red-600"}`}
            >
              {isExcellent ? "Excellent performance" : isGood ? "Good job" : "Keep practicing"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-green-300 rounded-lg p-2 text-center">
              <CheckCircle2 size={16} className="text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600">{correctCount}</p>
              <span className="text-xs text-gray-500">Correct</span>
            </div>
            <div className="border-2 border-red-300 rounded-lg p-2 text-center">
              <XCircle size={16} className="text-red-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-red-600">{questions.length - correctCount}</p>
              <span className="text-xs text-gray-500">Incorrect</span>
            </div>
          </div>

          <div className="flex gap-3">
            {status === "SUBMITTED" ? (
              <>
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#7C31F6] text-white font-semibold rounded-lg border-b-4 border-b-[#5c25b4] cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all"
                >
                  <RotateCcw size={16} /> Retry
                </button>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setStatus("IN_PROGRESS");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg border-b-4 border-b-gray-400 cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all"
                >
                  Review
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#7C31F6] text-white font-semibold rounded-lg border-b-4 border-b-[#5c25b4] cursor-pointer disabled:opacity-50 active:translate-y-1 active:transition-transform active:duration-75 transition-all disabled:active:translate-y-0"
                >
                  {submitting ? "Retrying..." : "Retry Save"}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg border-b-4 border-b-gray-400 cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all"
                >
                  <RotateCcw size={16} /> Start Over
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Main quiz UI ───────────────────────────────────────────────────────────
  return (
    <>
      {error && <ErrorBanner />}
      <div className="relative w-full max-w-xl">
        <div className="absolute top-6 right-6 z-50">
          <span className="inline-block px-4 py-1 text-sm font-medium bg-[#7C31F6] text-white rounded-full">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div
          key={currentQuestion.id}
          className={direction === "next" ? "quiz-slide-right" : "quiz-slide-left"}
        >
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            savedAnswer={currentAnswer}
            onSubmitAnswer={handleAnswerSubmit}
            onShowExplanation={() => setShowExplanation(true)}
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 border-b-4 border-b-gray-400 cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all disabled:active:translate-y-0"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="px-4 py-2 bg-[#7C31F6] text-white rounded-lg disabled:opacity-50 border-b-4 border-b-[#5c25b4] cursor-pointer active:translate-y-1 active:transition-transform active:duration-75 transition-all disabled:active:translate-y-0"
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>

        {/* Explanation Modal */}
        {currentAnswer?.submitted && showExplanation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold ${currentAnswer.isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {currentAnswer.isCorrect ? "✓ Correct Answer!" : "✗ Wrong Answer"}
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600 active:translate-y-1 active:transition-transform active:duration-75 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="text-sm text-gray-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 max-h-96 overflow-y-auto">
                <JsonRenderer content={currentQuestion.explanation as JSONContent} />
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="cursor-pointer mt-4 w-full px-4 py-2 bg-[#7C31F6] text-white rounded-lg font-medium border-b-4 border-b-[#5c25b4] active:translate-y-1 active:transition-transform active:duration-75 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
