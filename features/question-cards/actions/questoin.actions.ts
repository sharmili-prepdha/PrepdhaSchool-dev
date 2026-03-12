"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { QuestionType } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { InputJsonValue, JsonNullClass, JsonObject } from "@prisma/client/runtime/client";
import { JSONContent } from "@tiptap/core";

// EMPTY CONTENT CHECK
const CONTENT_NODE_TYPES = new Set([
  "image", // ImageBtnDialog → Image extension
  "inlineMath", // SigmaBtnPopover → @aarkue/tiptap-math-extension
  "mathInline", // fallback alias some versions use
]);

function hasContent(node: JSONContent): boolean {
  if (!node) return false;

  if (node.type === "text") {
    return typeof node.text === "string" && node.text.trim().length > 0;
  }

  if (typeof node.type === "string" && CONTENT_NODE_TYPES.has(node.type)) return true;

  if (node.type === "codeBlock" && Array.isArray(node.content)) {
    const raw = node.content.map((n: JSONContent) => n.text ?? "").join("") ?? "";
    return raw.length > 0;
  }

  if (Array.isArray(node.content)) {
    return node.content.some((n) => hasContent(n as JsonObject));
  }

  return false;
}

function isDocEmpty(doc: JSONContent): boolean {
  if (!doc) return true;
  return !hasContent(doc);
}

// ZOD SCHEMAS

// z.record(z.string(), z.any()) — validates it's a plain object
// but never touches, strips, or transforms any nested properties
// so attrs, marks, textAlign all pass through exactly as TipTap produced them
const nonEmptyRichDocSchema = z.record(z.string(), z.any()).refine((doc) => !isDocEmpty(doc), {
  message: "This field cannot be blank",
});

const optionalRichDocSchema = z.record(z.string(), z.any()).nullable();

const builderOptionSchema = z.object({
  content: nonEmptyRichDocSchema,
  isCorrect: z.boolean(),
});

const createQuestionSchema = z.object({
  topicId: z.number().positive("Topic ID must be a positive number"),
  type: z.enum(["MCQ", "MSQ", "TRUE_FALSE"]),
  content: nonEmptyRichDocSchema,
  explanation: optionalRichDocSchema,
  options: z.array(builderOptionSchema).min(2, "At least 2 options required"),
});

const updateQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  content: nonEmptyRichDocSchema,
  explanation: optionalRichDocSchema,
  options: z.array(builderOptionSchema).min(2, "At least 2 options required"),
});

// ACTION: GET QUESTIONS BY TOPIC ID

export async function getQuestionsByTopicId(topicId: number) {
  return await prisma.question.findMany({
    where: {
      topic_id: topicId,
      is_active: true,
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      options: {
        orderBy: {
          display_order: "asc",
        },
      },
    },
  });
}

// ACTION: CREATE QUESTION

export async function createQuestion(input: {
  topicId: number;
  type: QuestionType;
  content: string;
  explanation: string | null;
  options: { content: string; isCorrect: boolean }[];
}) {
  // Step 1 — Parse strings back to plain objects
  // Strings are used to pass TipTap JSON safely through React's flight serializer
  // without attrs (textAlign etc.) being stripped
  const parsedInput = {
    topicId: input.topicId,
    type: input.type,
    content: JSON.parse(input.content),
    explanation: input.explanation ? JSON.parse(input.explanation) : null,
    options: input.options.map((opt) => ({
      content: JSON.parse(opt.content),
      isCorrect: opt.isCorrect,
    })),
  };

  // Step 2 — Zod validation
  const parsed = createQuestionSchema.safeParse(parsedInput);
  if (!parsed.success) {
    console.error("createQuestion validation failed:", parsed.error.flatten());
    throw new Error("Invalid question data: " + JSON.stringify(parsed.error.flatten()));
  }

  const { topicId, type, content, explanation, options } = parsed.data;

  // Step 3 — Type-specific correctness rules
  if (type === "MCQ") {
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("MCQ must have exactly one correct option");
    }
  }

  if (type === "MSQ") {
    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      throw new Error("MSQ must have at least one correct option");
    }
  }

  if (type === "TRUE_FALSE") {
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("True/False must have exactly one correct answer");
    }
  }

  // Step 4 — Normalize blank explanation to null
  const normalizedExplanation = explanation && !isDocEmpty(explanation) ? explanation : null;

  // Step 5 — Save to DB
  const question = await prisma.question.create({
    data: {
      topic_id: topicId,
      type,
      content: content as InputJsonValue,
      explanation: normalizedExplanation as InputJsonValue | JsonNullClass,
      options: {
        create: options.map((opt, i) => ({
          content: opt.content as InputJsonValue,
          isCorrect: opt.isCorrect,
          display_order: i,
        })),
      },
    },
    include: {
      options: { orderBy: { display_order: "asc" } },
    },
  });

  revalidatePath("/mcq/create");
  return question;
}

// ACTION: UPDATE QUESTION

export async function updateQuestion(input: {
  id: string;
  content: string;
  explanation: string | null;
  options: { content: string; isCorrect: boolean }[];
}) {
  // Step 1 — Parse strings back to plain objects
  const parsedInput = {
    id: input.id,
    content: JSON.parse(input.content),
    explanation: input.explanation ? JSON.parse(input.explanation) : null,
    options: input.options.map((opt) => ({
      content: JSON.parse(opt.content),
      isCorrect: opt.isCorrect,
    })),
  };

  // Step 2 — Zod validation
  const parsed = updateQuestionSchema.safeParse(parsedInput);
  if (!parsed.success) {
    console.error("updateQuestion validation failed:", parsed.error.flatten());
    throw new Error("Invalid question data: " + JSON.stringify(parsed.error.flatten()));
  }

  const { id, content, explanation, options } = parsed.data;

  // Step 3 — Fetch existing type for rule enforcement
  const existing = await prisma.question.findUnique({
    where: { id },
    select: { type: true },
  });

  if (!existing) throw new Error("Question not found");

  if (existing.type === "MCQ") {
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("MCQ must have exactly one correct option");
    }
  }

  if (existing.type === "MSQ") {
    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      throw new Error("MSQ must have at least one correct option");
    }
  }

  // Step 4 — Normalize blank explanation to null
  const normalizedExplanation = explanation && !isDocEmpty(explanation) ? explanation : null;

  // Step 5 — Save to DB (delete options then recreate atomically)
  await prisma.$transaction(async (tx) => {
    await tx.option.deleteMany({ where: { question_id: id } });

    await tx.question.update({
      where: { id },
      data: {
        content: content as InputJsonValue,
        explanation: normalizedExplanation as InputJsonValue | JsonNullClass,
      },
    });

    for (const [i, opt] of options.entries()) {
      await tx.option.create({
        data: {
          question_id: id,
          content: opt.content as InputJsonValue,
          isCorrect: opt.isCorrect,
          display_order: i,
        },
      });
    }
  });

  revalidatePath("/mcq/create");
}

// ACTION: DELETE QUESTION

export async function deleteQuestion(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid question ID is required");
  }

  await prisma.$transaction([prisma.question.delete({ where: { id } })]);

  revalidatePath("/mcq/create");
}
