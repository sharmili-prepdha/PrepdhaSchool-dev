"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { TextbookPageMetadata } from "@/types/rich-text.types";
import type { JSONContent } from "@tiptap/react";

const loadByPageIdSchema = z.object({ pageId: z.number().int().min(1) });
const loadByMetadataSchema = z.object({
  grade: z.number().int().min(1),
  subject: z.string(),
  chapter: z.string(),
  pageNumber: z.number().int().min(1),
});

export type LoadDocumentResult =
  | {
      success: true;
      content: JSONContent;
      metadata: TextbookPageMetadata;
      pageId: number;
    }
  | { success: false; error: string };

export async function loadDocument(
  input:
    | z.infer<typeof loadByPageIdSchema>
    | z.infer<typeof loadByMetadataSchema>,
): Promise<LoadDocumentResult> {
  if ("pageId" in input) {
    const parsed = loadByPageIdSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    try {
      const page = await prisma.page.findUnique({
        where: { id: parsed.data.pageId },
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
      });
      if (!page) {
        return { success: false, error: "Page not found" };
      }
      const content: JSONContent =
        page.content_json != null && typeof page.content_json === "object"
          ? (page.content_json as JSONContent)
          : { type: "doc", content: [] };
      const cs = page.topic.chapter.book.class_subject;
      const metadata: TextbookPageMetadata = {
        title: page.topic.title,
        grade: cs.class_id,
        subject: cs.subject.name,
        textbookName: page.topic.chapter.book.title,
        chapter: page.topic.chapter.title,
        pageNumber: page.page_order,
      };
      return {
        success: true,
        content,
        metadata,
        pageId: page.id,
      };
    } catch (err) {
      console.error("loadDocument (by pageId) error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load document",
      };
    }
  }

  const parsed = loadByMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  try {
    const page = await prisma.page.findFirst({
      where: {
        is_published: true,
        page_order: parsed.data.pageNumber,
        topic: {
          chapter: {
            title: parsed.data.chapter,
            book: {
              class_subject: {
                class_id: parsed.data.grade,
                subject: { name: parsed.data.subject },
              },
            },
          },
        },
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
    });
    if (!page) {
      return {
        success: false,
        error: "No page found for this metadata",
      };
    }
    const content: JSONContent =
      page.content_json != null && typeof page.content_json === "object"
        ? (page.content_json as JSONContent)
        : { type: "doc", content: [] };
    const cs = page.topic.chapter.book.class_subject;
    const metadata: TextbookPageMetadata = {
      title: page.topic.title,
      grade: cs.class_id,
      subject: cs.subject.name,
      textbookName: page.topic.chapter.book.title,
      chapter: page.topic.chapter.title,
      pageNumber: page.page_order,
    };
    return {
      success: true,
      content,
      metadata,
      pageId: page.id,
    };
  } catch (err) {
    console.error("loadDocument (by metadata) error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load document",
    };
  }
}
