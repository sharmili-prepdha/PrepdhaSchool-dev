"use server";

import { getAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export type MarkPageReadResult =
    | { success: true; isCompleted: boolean; completedAt: Date }
    | { success: false; error: string };

export async function markPageReadAction(pageId: number): Promise<MarkPageReadResult> {
    const session = await getAuthUser();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.role !== "student") return { success: false, error: "Only students can mark pages as read" };

    // Look up the page to resolve class_subject_id
    const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
            topic: {
                include: {
                    chapter: {
                        include: {
                            book: { select: { class_subject_id: true } }
                        }
                    }
                }
            }
        }
    });

    if (!page) return { success: false, error: "Page not found" };

    const classSubjectId = page.topic.chapter.book.class_subject_id;
    const now = new Date();

    const result = await prisma.studentPageProgress.upsert({
        where: {
            student_id_page_id: {
                student_id: session.userId,
                page_id: pageId,
            },
        },
        create: {
            student_id: session.userId,
            page_id: pageId,
            class_subject_id: classSubjectId,
            is_completed: true,
            completed_at: now,
        },
        update: {
            is_completed: true,
            completed_at: now,
        },
    });

    return {
        success: true,
        isCompleted: result.is_completed,
        completedAt: result.completed_at!,
    };
}
