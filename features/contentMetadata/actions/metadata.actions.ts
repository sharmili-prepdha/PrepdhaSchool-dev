"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/auth";
import { Role } from "@/app/generated/prisma/enums";

type ActionResult = { success: true } | { success: false; error: string };

async function canManageClassSubject(
  classSubjectId: number,
  session: { role: string; schoolId: number | null },
): Promise<boolean> {
  if (session.role === Role.superadmin) return true;
  if (session.role !== Role.admin || session.schoolId == null) return false;
  const link = await prisma.schoolClassSubject.findUnique({
    where: {
      school_id_class_subject_id: {
        school_id: session.schoolId,
        class_subject_id: classSubjectId,
      },
    },
  });
  return !!link;
}

/**
 * Create a new Book (textbook) under a ClassSubject.
 */
export async function createBook(
  classSubjectId: number,
  title: string,
  orderNo?: number,
  thumbnailUrl?: string | null,
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const allowed = await canManageClassSubject(classSubjectId, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    const maxOrder = await prisma.book.aggregate({
      where: { class_subject_id: classSubjectId },
      _max: { order_no: true },
    });
    const nextOrder = orderNo ?? (maxOrder._max.order_no ?? 0) + 1;

    await prisma.book.create({
      data: {
        class_subject_id: classSubjectId,
        title: title.trim(),
        order_no: nextOrder,
        thumbnail_url: thumbnailUrl?.trim() || null,
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/superadmin/contentManagement");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("createBook error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create book",
    };
  }
}

/**
 * Update a Book's title or order.
 */
export async function updateBook(
  bookId: number,
  data: { title?: string; orderNo?: number; thumbnailUrl?: string | null },
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { class_subject_id: true },
  });
  if (!book) return { success: false, error: "Book not found" };
  const allowed = await canManageClassSubject(book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(data.title != null && { title: data.title.trim() }),
        ...(data.orderNo != null && { order_no: data.orderNo }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnail_url: data.thumbnailUrl?.trim() || null,
        }),
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/superadmin/contentManagement");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("updateBook error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update book",
    };
  }
}

/**
 * Create a new Chapter under a Book.
 */
export async function createChapter(
  bookId: number,
  title: string,
  orderNo?: number,
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { class_subject_id: true },
  });
  if (!book) return { success: false, error: "Book not found" };
  const allowed = await canManageClassSubject(book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    const maxOrder = await prisma.chapter.aggregate({
      where: { book_id: bookId },
      _max: { order_no: true },
    });
    const nextOrder = orderNo ?? (maxOrder._max.order_no ?? 0) + 1;

    await prisma.chapter.create({
      data: {
        book_id: bookId,
        title: title.trim(),
        order_no: nextOrder,
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/superadmin/contentManagement");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("createChapter error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create chapter",
    };
  }
}

/**
 * Create a new Topic under a Chapter.
 */
export async function createTopic(
  chapterId: number,
  title: string,
  orderNo?: number,
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { class_subject_id: true } } },
  });
  if (!chapter) return { success: false, error: "Chapter not found" };
  const allowed = await canManageClassSubject(chapter.book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    const maxOrder = await prisma.topic.aggregate({
      where: { chapter_id: chapterId },
      _max: { order_no: true },
    });
    const nextOrder = orderNo ?? ((maxOrder._max?.order_no ?? 0) + 1);

    await prisma.topic.create({
      data: {
        chapter_id: chapterId,
        title: title.trim(),
        order_no: nextOrder,
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/superadmin/contentManagement");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("createTopic error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create topic",
    };
  }
}

/**
 * Update a Topic's title or order.
 */
export async function updateTopic(
  topicId: number,
  data: { title?: string; orderNo?: number },
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { chapter: { include: { book: { select: { class_subject_id: true } } } } },
  });
  if (!topic) return { success: false, error: "Topic not found" };
  const allowed = await canManageClassSubject(topic.chapter.book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(data.title != null && { title: data.title.trim() }),
        ...(data.orderNo != null && { order_no: data.orderNo }),
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("updateTopic error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update topic",
    };
  }
}

/**
 * Create a new Page under a Topic.
 */
export async function createPage(
  topicId: number,
  pageOrder?: number,
): Promise<ActionResult & { pageId?: number }> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { chapter: { include: { book: { select: { class_subject_id: true } } } } },
  });
  if (!topic) return { success: false, error: "Topic not found" };
  const allowed = await canManageClassSubject(topic.chapter.book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    const maxOrder = await prisma.page.aggregate({
      where: { topic_id: topicId },
      _max: { page_order: true },
    });
    const nextOrder = pageOrder ?? (maxOrder._max.page_order ?? 0) + 1;

    const page = await prisma.page.create({
      data: {
        topic_id: topicId,
        page_order: nextOrder,
        content_json: { type: "doc", content: [] },
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/admin/contentMetadata");
    return { success: true, pageId: page.id };
  } catch (err) {
    console.error("createPage error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create page",
    };
  }
}

/**
 * Update a Page's order or published status.
 */
export async function updatePage(
  pageId: number,
  data: { pageOrder?: number; isPublished?: boolean },
): Promise<ActionResult> {
  const session = await getAuthUser();
  if (!session) return { success: false, error: "Unauthorized" };
  if (session.role !== Role.superadmin && session.role !== Role.admin) {
    return { success: false, error: "Invalid role" };
  }
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      topic: { include: { chapter: { include: { book: { select: { class_subject_id: true } } } } } },
    },
  });
  if (!page) return { success: false, error: "Page not found" };
  const allowed = await canManageClassSubject(page.topic.chapter.book.class_subject_id, session);
  if (!allowed) return { success: false, error: "Access denied" };

  try {
    await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(data.pageOrder != null && { page_order: data.pageOrder }),
        ...(data.isPublished != null && { is_published: data.isPublished }),
      },
    });
    revalidatePath("/superadmin/contentMetadata");
    revalidatePath("/admin/contentMetadata");
    return { success: true };
  } catch (err) {
    console.error("updatePage error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update page",
    };
  }
}
