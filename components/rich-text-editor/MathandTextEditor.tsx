import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import { useRef, useEffect, useState, useCallback } from "react";
import { EquationEditDialog } from "./EquationEditDialog";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

type MathEditType = "inline" | "block";

export function MathAndTextEditor({ value, onChange }: EditorProps) {
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const [equationDialogOpen, setEquationDialogOpen] = useState(false);
  const [equationDialogState, setEquationDialogState] = useState<{
    initialEquation: string;
    type: MathEditType;
    pos: number;
  } | null>(null);

  const openEquationDialog = useCallback((latex: string, type: MathEditType, pos: number) => {
    setEquationDialogState({ initialEquation: latex, type, pos });
    setEquationDialogOpen(true);
  }, []);

  const handleEquationSubmit = useCallback(
    (equation: string) => {
      const currentEditor = editorRef.current;
      if (!currentEditor || !equationDialogState) return;
      const { type, pos } = equationDialogState;
      if (type === "inline") {
        currentEditor.chain().setNodeSelection(pos).updateInlineMath({ latex: equation, pos }).focus().run();
      } else {
        currentEditor.chain().setNodeSelection(pos).updateBlockMath({ latex: equation, pos }).focus().run();
      }
      setEquationDialogOpen(false);
      setEquationDialogState(null);
    },
    [equationDialogState]
  );

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: false,
          output: 'html'
        },
        inlineOptions: {
          onClick: (node, pos) => {
            openEquationDialog(node.attrs.latex, "inline", pos);
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            openEquationDialog(node.attrs.latex, "block", pos);
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <>
      <div className="prose prose-sm max-w-none min-h-[60px] w-full min-w-0 p-2 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:w-full [&_.ProseMirror]:min-h-[44px]">
        <EditorContent editor={editor} />
      </div>
      {equationDialogState && (
        <EquationEditDialog
          open={equationDialogOpen}
          onOpenChange={(open) => {
            setEquationDialogOpen(open);
            if (!open) setEquationDialogState(null);
          }}
          initialEquation={equationDialogState.initialEquation}
          onSubmit={handleEquationSubmit}
        />
      )}
    </>
  );
}