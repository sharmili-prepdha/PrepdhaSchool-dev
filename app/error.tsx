"use client";

import { logger } from "@/lib/logger";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can integrate Sentry or logging service here
    logger.error(`Global error caught:${error}`,);
  }, [error]);

  return (
    <div
      style={{
        padding: "60px",
        textAlign: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>Something went wrong</h1>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        An unexpected error occurred. Please try again.
      </p>

      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
