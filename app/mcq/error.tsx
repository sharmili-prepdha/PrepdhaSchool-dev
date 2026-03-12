"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h2 className="text-red-500 font-semibold text-lg mb-4">
        Something went wrong while loading the question.
      </h2>
      <p>{error.message}</p>

      <button
        onClick={() => reset()}
        className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
      >
        Try Again
      </button>
    </div>
  );
}