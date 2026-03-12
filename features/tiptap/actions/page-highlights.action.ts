"use server";

import { z } from "zod";

import { getAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { UserHighlight } from "@/types/rich-text.types";

const saveHighlightsSchema = z.object({
  pageId: z.number().int().min(1),
  highlights: z.array(
    z.object({
      fromPos: z.number().int().min(0),
      toPos: z.number().int().min(0),
      color: z.string().optional(),
    }),
  ),
});

export type SavePageHighlightsInput = z.infer<typeof saveHighlightsSchema>;

export type SavePageHighlightsResult =
  | { success: true }
  | { success: false; error: string };

export async function savePageHighlights(
  input: SavePageHighlightsInput,
): Promise<SavePageHighlightsResult> {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = saveHighlightsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { pageId, highlights } = parsed.data;

  try {
    await prisma.pageHighlight.deleteMany({
      where: {
        page_id: pageId,
        student_id: authUser.userId
      },
    });

    if (highlights.length > 0) {
      await prisma.pageHighlight.createMany({
        data: highlights.map((h) => ({
          page_id: pageId,
          student_id: authUser.userId,
          from_pos: h.fromPos,
          to_pos: h.toPos,
          color: h.color ?? null,
        })),
      });
    }

    return { success: true };
  } catch (err) {
    console.error("savePageHighlights error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save highlights",
    };
  }
}

const loadHighlightsSchema = z.object({
  pageId: z.number().int().min(1),
});

export type LoadPageHighlightsResult =
  | { success: true; highlights: UserHighlight[] }
  | { success: false; error: string };

export async function loadPageHighlights(
  input: z.infer<typeof loadHighlightsSchema>,
): Promise<LoadPageHighlightsResult> {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = loadHighlightsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { pageId } = parsed.data;

  try {
    const rows = await prisma.pageHighlight.findMany({
      where: {
        page_id: pageId,
        student_id: authUser.userId
      },
      orderBy: { from_pos: "asc" },
    });

    const highlights: UserHighlight[] = rows.map((r) => ({
      fromPos: r.from_pos,
      toPos: r.to_pos,
      color: r.color ?? undefined,
    }));

    return { success: true, highlights };
  } catch (err) {
    console.error("loadPageHighlights error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load highlights",
    };
  }
}
