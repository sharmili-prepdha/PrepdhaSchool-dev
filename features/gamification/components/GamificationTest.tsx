"use client";

import { useGamificationEvent } from "@/features/gamification/components/useGamificationEvent";

export function GamificationTest() {
  const [triggerEvent, { isPending, lastState, error }] = useGamificationEvent();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Gamification Test</h3>

      <div className="space-y-2">
        <button
          onClick={() => triggerEvent("LOGIN")}
          disabled={isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isPending ? "Triggering..." : "Trigger Login Event"}
        </button>

        <button
          onClick={() => triggerEvent("ANSWER_CORRECT")}
          disabled={isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isPending ? "Triggering..." : "Trigger Correct Answer"}
        </button>

        <button
          onClick={() => triggerEvent("REVISION_COMPLETE")}
          disabled={isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isPending ? "Triggering..." : "Trigger Revision Complete"}
        </button>

        <button
          onClick={() => triggerEvent("NEW_TOPIC_COMPLETE")}
          disabled={isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isPending ? "Triggering..." : "Trigger New Topic Complete"}
        </button>

        <button
          onClick={() => triggerEvent("DID_FLASHCARDS")}
          disabled={isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isPending ? "Triggering..." : "Trigger Did Flashcards"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}

      {lastState && (
        <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          <h4 className="font-semibold">Current State:</h4>
          <p>Total XP: {lastState.totalXp}</p>
          <p>Current Streak: {lastState.currentStreak}</p>
          <p>Longest Streak: {lastState.longestStreak}</p>
          <p>Last Active: {lastState.lastActiveDate?.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
