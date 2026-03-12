import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
// import Image from "@tiptap/extension-image";
import { ResizableImage } from "./ResizableImage";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import MathExtension from "@aarkue/tiptap-math-extension";

// We require katex styles for the math extension to render properly
import "katex/dist/katex.min.css";

export const getExtensions = (placeholderText: string) => [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
    orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
    link: { HTMLAttributes: { class: "text-primary underline underline-offset-4 cursor-pointer" } },
    heading: {
      levels: [1, 2, 3],
    },
    codeBlock: {
      HTMLAttributes: {
        class: "bg-muted p-4 rounded-md font-mono text-sm",
      },
    },
  }),
  Subscript,
  Superscript,
  MathExtension.configure({
    evaluation: false, // We only want rendering, not evaluation for MCQs
  }),
  // Image.configure({
  //   inline: true,
  //   HTMLAttributes: {
  //     class: "max-w-full rounded-md border border-border my-4",
  //   },
  // }),
  ResizableImage.configure({
    inline: true,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph", "image"],
  }),
  Placeholder.configure({
    placeholder: placeholderText,
    emptyEditorClass:
      "cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-muted-foreground before:opacity-50 before:pointer-events-none",
  }),
];