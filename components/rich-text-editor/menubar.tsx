import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  MessageCircleQuestionIcon,
  ImageIcon,
  Youtube,
  Table as TableIcon,
  Sigma,
  Upload,
  Code,
  Pi,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { menuBarStateSelector } from "./menuBarState";
import { McqDialog } from "./McqDialog";
import { ImageDialog } from "./image-dialog";
import { EquationEditDialog } from "./EquationEditDialog";
import { useState } from "react";

type MathInsertType = "inline" | "block";

type McqInsertOptions = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type McqInsertChain = {
  insertMcq: (options: McqInsertOptions) => { run: () => boolean };
};

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [equationInsertDialogOpen, setEquationInsertDialogOpen] = useState(false);
  const [equationInsertType, setEquationInsertType] = useState<MathInsertType>("inline");
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  if (!editor) {
    return null;
  }
  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
    },
    {
      icon: <MessageCircleQuestionIcon className="size-4" />,
      onClick: () => setIsMcqModalOpen(true),
      pressed: editor.isActive("mcq"),
    },
    {
      icon: <ImageIcon className="size-4" />,
      onClick: () => {
        setIsImageDialogOpen(true);
      },
      pressed: editorState?.isImage,
    },
    {
      icon: <Upload className="size-4" />,
      onClick: () => {
        editor.chain().focus().setImageUploadNode().run();
      },
      pressed: editorState?.isImageUpload,
    },
    {
      icon: <Youtube className="size-4" />,
      onClick: () => {
        const url = window.prompt("Enter YouTube URL");
        if (url) {
          editor.commands.setYoutubeVideo({
            src: url,
            width: 640,
            height: 480,
          });
        }
      },
      pressed: editorState?.isYoutube,
    },
    {
      icon: <TableIcon className="size-4" />,
      onClick: () => {
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
      pressed: editorState?.isTable,
    },
    {
      icon: <Sigma className="size-4" />,
      onClick: () => {
        setEquationInsertType("inline");
        setEquationInsertDialogOpen(true);
      },
      pressed: editorState?.isInlineMath,
    },
    {
      icon: <Pi className="size-4" />,
      onClick: () => {
        setEquationInsertType("block");
        setEquationInsertDialogOpen(true);
      },
      pressed: editorState?.isBlockMath,
    },
    {
      icon: <Code className="size-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      pressed: editor.isActive("codeBlock"),
    },
  ];

  return (
    <>
      <McqDialog
        open={isMcqModalOpen}
        onOpenChange={setIsMcqModalOpen}
        onSubmit={(data) => {
          const chain = editor.chain().focus() as unknown as McqInsertChain;
          chain.insertMcq(data).run();
        }}
      />
      <ImageDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onSubmit={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
        }}
      />
      <EquationEditDialog
        open={equationInsertDialogOpen}
        onOpenChange={setEquationInsertDialogOpen}
        initialEquation=""
        title={equationInsertType === "inline" ? "Insert Inline Equation" : "Insert Block Equation"}
        submitButtonText="Insert"
        onSubmit={(latex) => {
          if (equationInsertType === "inline") {
            editor.chain().focus().insertInlineMath({ latex }).run();
          } else {
            editor.chain().focus().insertBlockMath({ latex }).run();
          }
          setEquationInsertDialogOpen(false);
        }}
      />
      <div className="border rounded-md p-1 mb-1 bg-slate-50 space-x-2 z-50">
        {Options.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.onClick}
          >
            {option.icon}
          </Toggle>
        ))}
      </div>
    </>
  );
};
