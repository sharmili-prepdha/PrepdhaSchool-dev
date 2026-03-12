"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createPage } from "@/features/contentMetadata/actions/metadata.actions";

const saveDocumentSchema = z.object({
  pageId: z.number().int().min(1).optional(),
  topicId: z.number().int().min(1).optional(),
  content: z.record(z.string(), z.unknown()),
  metadata: z
    .object({
      grade: z.number().int().min(1).optional(),
      subject: z.string().optional(),
      textbookName: z.string().optional(),
      chapter: z.string().optional(),
      pageNumber: z.number().int().min(1).optional(),
      title: z.string().optional(),
      schoolId: z.number().int().optional(),
    })
    .optional(),
});

export type SaveDocumentInput = z.infer<typeof saveDocumentSchema>;

export type SaveDocumentResult =
  | { success: true; pageId: number }
  | { success: false; error: string };

export async function saveDocument(
  input: SaveDocumentInput,
): Promise<SaveDocumentResult> {
  const parsed = saveDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const { pageId, topicId, content, metadata } = parsed.data;

  if (topicId && !pageId) {
    try {
      const createResult = await createPage(topicId);
      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }
      if (!createResult.pageId) {
        return { success: false, error: "Page creation failed" };
      }
      const newPageId = createResult.pageId;
      await prisma.page.update({
        where: { id: newPageId },
        data: {
          content_json: content as object,
          content_html: null,
          content_text: null,
          updated_at: new Date(),
        },
      });
      revalidatePath("/superadmin/contentManagement");
      revalidatePath("/admin/contentManagement");
      return { success: true, pageId: newPageId };
    } catch (err) {
      console.error("saveDocument (create by topicId) error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create and save page",
      };
    }
  }

  if (pageId) {
    try {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
      });
      if (!page) {
        return { success: false, error: "Page not found" };
      }
      await prisma.page.update({
        where: { id: pageId },
        data: {
          content_json: content as object,
          content_html: null,
          content_text: null,
          updated_at: new Date(),
        },
      });
      return { success: true, pageId };
    } catch (err) {
      console.error("saveDocument (by pageId) error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save document",
      };
    }
  }

  const meta = metadata;
  if (
    meta &&
    meta.grade != null &&
    meta.subject &&
    meta.chapter != null &&
    meta.pageNumber != null
  ) {
    try {
      const page = await prisma.page.findFirst({
        where: {
          page_order: meta.pageNumber,
          topic: {
            title: meta.chapter,
            chapter: {
            is: {
              book: {
                ...(meta.textbookName && { title: meta.textbookName }),
                class_subject: {
                  class_id: meta.grade,
                  subject: { name: meta.subject },
                   },
                  }
                },
              }
            },
        },
      });
      if (!page) {
        return {
          success: false,
          error: "No page found for this metadata. Create the page first.",
        };
      }
      await prisma.page.update({
        where: { id: page.id },
        data: {
          content_json: content as object,
          content_html: null,
          content_text: null,
          updated_at: new Date(),
        },
      });
      return { success: true, pageId: page.id };
    } catch (err) {
      console.error("saveDocument (by metadata) error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save document",
      };
    }
  }

  return {
    success: false,
    error:
      "Provide pageId, topicId (to create new page), or metadata with grade, subject, chapter, pageNumber (to update existing page)",
  };
}
