"use client";

export function FlashcardLayout({
  flipped,
  children,
  className,
}: {
  flipped: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative perspective-1000 ${className ?? ""}`}
    >
      <div
        className={`relative w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}