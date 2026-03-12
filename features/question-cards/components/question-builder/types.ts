import type { JSONContent } from "@tiptap/react";
import type { QuestionType } from "@/app/generated/prisma/enums";

export type DraftOption = {
  id?: string; // present when editing an existing question
  content: JSONContent;
  isCorrect: boolean;
};

export type Draft = {
  content: JSONContent;
  explanation: JSONContent | null;
  options: DraftOption[];
};

export type EditingField =
  | { type: "question" }
  | { type: "option"; optionIndex: number }
  | { type: "explanation" }
  | null;

export type QuestionOption = {
  id: string;
  content: JSONContent;
  isCorrect: boolean;
  displayOrder: number;
};

export type Question = {
  id: string;
  topicId: number;
  type: QuestionType;
  content: JSONContent;
  explanation: JSONContent | null;
  options: QuestionOption[];
};

export type GroupedQuestions = {
  MCQ: Question[];
  MSQ: Question[];
  TRUE_FALSE: Question[];
};

export type PendingAction = () => void;

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function buildDefaultDraft(type: QuestionType): Draft {
  if (type === "TRUE_FALSE") {
    return {
      content: EMPTY_DOC,
      explanation: null,
      options: [
        {
          content: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "True" }] },
            ],
          },
          isCorrect: false,
        },
        {
          content: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "False" }] },
            ],
          },
          isCorrect: false,
        },
      ],
    };
  }
  return {
    content: EMPTY_DOC,
    explanation: null,
    options: [
      { content: EMPTY_DOC, isCorrect: false },
      { content: EMPTY_DOC, isCorrect: false },
    ],
  };
}

export function questionToDraft(q: Question): Draft {
  return {
    content: q.content,
    explanation: q.explanation,
    options: q.options.map((opt) => ({
      id: opt.id,
      content: opt.content,
      isCorrect: opt.isCorrect,
    })),
  };
}

export function groupQuestions(questions: Question[]): GroupedQuestions {
  return {
    MCQ: questions.filter((q) => q.type === "MCQ"),
    MSQ: questions.filter((q) => q.type === "MSQ"),
    TRUE_FALSE: questions.filter((q) => q.type === "TRUE_FALSE"),
  };
}

export function searchQuestions(
  questions: Question[],
  query: string,
): Question[] {
  if (!query.trim()) return questions;
  const lower = query.toLowerCase();
  return questions.filter((q) =>
    JSON.stringify(q.content).toLowerCase().includes(lower),
  );
}
