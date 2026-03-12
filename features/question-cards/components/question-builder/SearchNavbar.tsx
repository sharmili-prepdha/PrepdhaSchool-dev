"use client";

import { X } from "lucide-react";

interface SearchNavbarProps {
  topicId: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function SearchNavbar({
  topicId,
  searchQuery,
  onSearchChange,
  onClear,
}: SearchNavbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-background shrink-0">
      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
        Topic: <code className="bg-muted px-1 py-0.5 rounded">{topicId}</code>
      </span>

      <div className="relative flex-1 max-w-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-md border px-3 py-1.5 text-sm pr-8 bg-background"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {searchQuery && (
        <span className="text-xs text-gray-400">
          Searching in current topic
        </span>
      )}
    </div>
  );
}
