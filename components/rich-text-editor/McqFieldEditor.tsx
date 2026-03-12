"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics, migrateMathStrings } from "@tiptap/extension-mathematics";
import { useRef, useEffect, useState, useCallback } from "react";
import { Sigma, Pi } from "lucide-react";
import { EquationEditDialog } from "./EquationEditDialog";
import { Button } from "@/components/ui/button";

interface McqFieldEditorProps {
  value: string;
  onChange: (content: string) => void;
}

type MathInsertType = "inline" | "block";

/**
 * Rich text editor for MCQ fields (question, options, explanation).
 * Supports both normal text and LaTeX math via Sigma (inline) and Pi (block) buttons.
 * Converts $...$ syntax to math nodes on load via migrateMathStrings.
 */
export function McqFieldEditor({ value, onChange }: McqFieldEditorProps) {
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [insertDialogType, setInsertDialogType] = useState<MathInsertType>("inline");
  const [editDialogState, setEditDialogState] = useState<{
    latex: string;
    type: MathInsertType;
    pos: number;
  } | null>(null);

  const openInsertDialog = useCallback((type: MathInsertType) => {
    setInsertDialogType(type);
    setInsertDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((latex: string, type: MathInsertType, pos: number) => {
    setInsertDialogOpen(false);
    setEditDialogState({ latex, type, pos });
  }, []);

  const handleInsertSubmit = useCallback(
    (latex: string) => {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;
      if (insertDialogType === "inline") {
        currentEditor.chain().focus().insertInlineMath({ latex }).run();
      } else {
        currentEditor.chain().focus().insertBlockMath({ latex }).run();
      }
      setInsertDialogOpen(false);
    },
    [insertDialogType]
  );

  const handleEditSubmit = useCallback(
    (latex: string) => {
      const currentEditor = editorRef.current;
      if (!currentEditor || !editDialogState) return;
      const { type, pos } = editDialogState;
      if (type === "inline") {
        currentEditor.chain().setNodeSelection(pos).updateInlineMath({ latex, pos }).focus().run();
      } else {
        currentEditor.chain().setNodeSelection(pos).updateBlockMath({ latex, pos }).focus().run();
      }
      setEditDialogState(null);
    },
    [editDialogState]
  );

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: false,
          output: "html",
        },
        inlineOptions: {
          onClick: (node, pos) => {
            openEditDialog(node.attrs.latex, "inline", pos);
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            openEditDialog(node.attrs.latex, "block", pos);
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    onCreate: ({ editor: ed }) => {
      migrateMathStrings(ed);
      onChange(ed.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Sync external value changes (e.g. when dialog opens with different initialData)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value ?? "",  { emitUpdate: false });
      migrateMathStrings(editor);
    }
  }, [value, editor]);

  return (
    <>
      <div className="flex flex-col gap-1 w-full min-w-0">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => openInsertDialog("inline")}
            title="Insert inline math"
          >
            <Sigma className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => openInsertDialog("block")}
            title="Insert block math"
          >
            <Pi className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="prose prose-sm max-w-none min-h-[52px] w-full min-w-0 p-2 rounded-md border border-input bg-transparent transition-[color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 [&_.ProseMirror]:outline-none [&_.ProseMirror]:w-full [&_.ProseMirror]:min-h-[36px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      <EquationEditDialog
        open={insertDialogOpen}
        onOpenChange={(open) => {
          setInsertDialogOpen(open);
        }}
        initialEquation=""
        title={insertDialogType === "inline" ? "Insert Inline Equation" : "Insert Block Equation"}
        submitButtonText="Insert"
        onSubmit={handleInsertSubmit}
      />

      {editDialogState && (
        <EquationEditDialog
          open={!!editDialogState}
          onOpenChange={(open) => {
            if (!open) setEditDialogState(null);
          }}
          initialEquation={editDialogState.latex}
          title="Edit Equation"
          submitButtonText="Save"
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}
