import { Node, mergeAttributes, type Command } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { McqNodeView } from "../components/rich-text-editor/McqNodeView";

declare module "@tiptap/core" {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    mcq: {
      insertMcq: (options: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }) => ReturnType;
    };
  }
}

export const Mcq = Node.create({
  name: "mcq",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      question: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-question") ?? "",
        renderHTML: (attrs) => ({ "data-question": attrs.question }),
      },
      options: {
        default: ["", "", "", ""],
        parseHTML: (el) => {
          const val = el.getAttribute("data-options");
          if (!val) return ["", "", "", ""];
          try {
            const parsed = JSON.parse(val) as string[];
            return Array.isArray(parsed) ? parsed : ["", "", "", ""];
          } catch {
            return ["", "", "", ""];
          }
        },
        renderHTML: (attrs) => ({ "data-options": JSON.stringify(attrs.options) }),
      },
      correctAnswer: {
        default: 0,
        parseHTML: (el) => parseInt(el.getAttribute("data-correct-answer") ?? "0", 10) || 0,
        renderHTML: (attrs) => ({ "data-correct-answer": String(attrs.correctAnswer) }),
      },
      explanation: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-explanation") ?? "",
        renderHTML: (attrs) => ({ "data-explanation": attrs.explanation }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "mcq-block" }];
  },

  renderHTML({ HTMLAttributes: htmlAttributes }) {
    return ["mcq-block", mergeAttributes(htmlAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(McqNodeView);
  },

  addCommands() {
    return {
      insertMcq:
        (options: {
          question: string;
          options: string[];
          correctAnswer: number;
          explanation: string;
        }): Command =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          },
    };
  },
});
