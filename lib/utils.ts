import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Simple deterministic pseudo-random function using a seed
export function getRandomMessageIndex(arrayLength: number, seed: number = Date.now()): number {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * arrayLength);
}
