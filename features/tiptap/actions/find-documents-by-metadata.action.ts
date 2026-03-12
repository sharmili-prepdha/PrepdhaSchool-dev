"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { TextbookPageMetadata } from "@/types/rich-text.types";

const findSchema = z.object({
  grade: z.number().int().min(1).optional(),
  subject: z.string().optional(),
  textbookName: z.string().optional(),
  chapter: z.string().optional(),
  pageNumber: z.number().int().min(1).optional(),
});

export type FindDocumentsByMetadataInput = z.infer<typeof findSchema>;

export type PageSummary = {
  pageId: number;
  metadata: TextbookPageMetadata;
};

export type FindDocumentsByMetadataResult =
  | { success: true; pages: PageSummary[] }
  | { success: false; error: string };

/**
 * Find pages by textbook metadata.
 */
export async function findDocumentsByMetadata(
  input: FindDocumentsByMetadataInput,
): Promise<FindDocumentsByMetadataResult> {
  const parsed = findSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { grade, subject, textbookName, chapter, pageNumber } = parsed.data;

  try {
    const classSubjectWhere: Record<string, unknown> = {};
    if (grade != null) {
      classSubjectWhere.class_id = grade;
    }
    if (subject != null && subject !== "") {
      classSubjectWhere.subject = { name: subject };
    }

    const bookWhere: Record<string, unknown> = {};
    if (textbookName != null && textbookName !== "") {
      bookWhere.title = textbookName;
    }
    if (Object.keys(classSubjectWhere).length > 0) {
      bookWhere.class_subject = classSubjectWhere;
    }

    const topicWhere: Record<string, unknown> = {};
    if (chapter != null && chapter !== "") {
      topicWhere.chapter = { title: chapter };
    }
    if (Object.keys(bookWhere).length > 0) {
      topicWhere.chapter = { ...(topicWhere.chapter as object), book: bookWhere };
    }

    const topicFilter =
      Object.keys(topicWhere).length > 0 ? { topic: topicWhere } : {};

    const pages = await prisma.page.findMany({
      where: {
        is_published: true,
        ...(pageNumber != null && { page_order: pageNumber }),
        ...topicFilter,
      },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                book: {
                  include: {
                    class_subject: {
                      include: { class: true, subject: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ topic_id: "asc" }, { page_order: "asc" }],
    });

    const pageSummaries: PageSummary[] = pages.map((p) => {
      const cs = p.topic.chapter.book.class_subject;
      return {
        pageId: p.id,
        metadata: {
          title: p.topic.title,
          grade: cs.class_id,
          subject: cs.subject.name,
          textbookName: p.topic.chapter.book.title,
          chapter: p.topic.chapter.title,
          pageNumber: p.page_order,
        },
      };
    });

    return { success: true, pages: pageSummaries };
  } catch (err) {
    console.error("findDocumentsByMetadata error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to find pages",
    };
  }
}
