import { NextCard } from "@/app/api/flashcard/type";
import { Flashcard } from "@/app/generated/prisma/client";
import { ReviewQuality } from "@/app/generated/prisma/enums";
import { logger } from "@/lib/logger";

export class FlashcardScheduler {
  queue: NextCard[] = [];
  learningQueue: NextCard[] = [];
  sessionCardIds: Set<number> = new Set();
  length: number = 0;

  getTotalSessionCards(): number {
    return this.sessionCardIds.size;
  }

  getTotalCardsLength(): number {
    return this.length;
  }

  async init(): Promise<void> {
    this.length = await this.refill();
  }

  async getNextCard(): Promise<NextCard | null> {
    try {
      const now = Date.now();
      let minIndex = -1;
      for (const [index, item] of this.learningQueue.entries()) {
        if (!item.dueAt || item.dueAt > now) continue;

        if (minIndex === -1 || item.dueAt < this.learningQueue[minIndex].dueAt!) {
          minIndex = index;
        }
      }
      
      if (minIndex !== -1) {
        return this.learningQueue.splice(minIndex, 1)[0];
      }

      if (this.queue.length > 0) {
        return this.queue.shift()!;
      }

      // NEW: if review is done -> process learning queue immediately
      if (this.learningQueue.length > 0) {
        const card = this.learningQueue.shift()!;
        return card;
      }

      if (this.learningQueue.length === 0) {
        await this.refill();
      }

      return this.queue.shift() ?? null;
    } catch (error) {
      logger.error({ error }, "getNextCard crashed");
      return null;
    }
  }

  async refill() {
    try {
      const res = await fetch("/api/flashcard/v1/refill", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      this.queue = data?.data ?? [];

      // Track unique cards introduced in this session
      for (const card of this.queue) {
        this.sessionCardIds.add(card.flashcard.id);
      }
      return data?.length ?? 0;
    } catch (error) {
      logger.error({ error }, "Refill request crashed");
    }
  }

  async processAnswer(card: NextCard, rating: ReviewQuality) {
    try {
      const res = await fetch("/api/flashcard/v1/review", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          flashcardId: card.flashcard.id,
          rating,
        }),
      });

      const data = await res.json();

      if (!data?.data.next_review_at) return;

      // ✅ REMOVE FIRST (very important)
      const cardId = card.flashcard.id;
      this.removeFromQueues(cardId);

      const dueAt = new Date(data.data.next_review_at).getTime();
      // interval factor are in second.
      const delay = data.data.interval_factor;
      const ONE_DAY_MS = 86400;

      if (delay >= ONE_DAY_MS) return;

      const updatedCard: NextCard = {
        ...card,
        reviewState: data.data,
        dueAt,
        isRepeat: true,
      };

      this.learningQueue.push(updatedCard);
    } catch (error) {
      logger.error({ error }, "getNextCard crashed");
      return null;
    }
  }

  removeCard(cardId: number) {
    this.sessionCardIds.delete(cardId);
    this.removeFromQueues(cardId);
    this.length--;
  }

  updateCard(updatedCard: Flashcard) {
    const updateInArray = (arr: NextCard[]) =>
      arr.map((c) => (c.flashcard.id === updatedCard.id ? { ...c, flashcard: updatedCard } : c));

    this.queue = updateInArray(this.queue);
    this.learningQueue = updateInArray(this.learningQueue);
  }

  private removeFromQueues(cardId: number) {
    this.learningQueue = this.learningQueue.filter((c) => c.flashcard.id !== cardId);

    this.queue = this.queue.filter((c) => c.flashcard.id !== cardId);
  }
}
