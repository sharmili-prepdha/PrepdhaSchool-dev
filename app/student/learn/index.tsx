"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { EditorContent, JSONContent, useEditor, type Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Mathematics } from "@tiptap/extension-mathematics";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node";
import "katex/dist/katex.min.css";
import { MenuBar } from "./menubar";
import { Mcq } from "@/extensions/Mcq";
import UniqueID from "@tiptap/extension-unique-id";
import FileHandler from "@tiptap/extension-file-handler";
import { EquationEditDialog } from "./EquationEditDialog";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: Content;
  onchange: (content: JSONContent) => void;
  toolbarRight?: React.ReactNode;
}

type MathEditType = "inline" | "block";

export default function RichTextEditor({ content, onchange, toolbarRight }: RichTextEditorProps) {
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [equationDialogOpen, setEquationDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
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
        currentEditor
          .chain()
          .setNodeSelection(pos)
          .updateInlineMath({ latex: equation, pos })
          .focus()
          .run();
      } else {
        currentEditor
          .chain()
          .setNodeSelection(pos)
          .updateBlockMath({ latex: equation, pos })
          .focus()
          .run();
      }
      setEquationDialogOpen(false);
      setEquationDialogState(null);
    },
    [equationDialogState],
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
    setImportError(null);
    e.target.value = "";
  }, []);

  const handleProcessDocx = useCallback(async () => {
    if (!selectedFile || !editorRef.current) return;
    setIsProcessing(true);
    setImportError(null);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editorRef.current.commands.setContent(result.value, { emitUpdate: false });
      onchange(editorRef.current.getJSON());
      setSelectedFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import DOCX";
      setImportError(message);
      logger.error(`DOCX import failed: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, onchange]);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
        codeBlock: {
          enableTabIndentation: true,
          HTMLAttributes: {
            class: "rounded-md bg-stone-100 p-2 font-mono font-medium text-stone-950",
          },
        },
      }),
      UniqueID.configure({
        types: ["doc", "heading", "paragraph", "mcq"],
      }),
      FileHandler.configure({
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],

        onDrop: async (currentEditor, files, pos) => {
          const { handleImageUpload } = await import("@/lib/tiptap-utils");

          for (const file of files) {
            try {
              const imageUrl = await handleImageUpload(file);

              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: "image",
                  attrs: { src: imageUrl },
                })
                .focus()
                .run();
            } catch (error) {
              logger.error(`Upload failed:${error}`);
            }
          }
        },

        onPaste: async (currentEditor, files, htmlContent) => {
          if (htmlContent) return false;

          const { handleImageUpload } = await import("@/lib/tiptap-utils");

          for (const file of files) {
            try {
              const imageUrl = await handleImageUpload(file);

              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: "image",
                  attrs: { src: imageUrl },
                })
                .focus()
                .run();
            } catch (error) {
              logger.error(`Upload failed:${error}`);
            }
          }
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      Mcq,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: false,
          output: "html",
        },
        inlineOptions: {
          onClick: (node, pos) => {
            if (!editorRef.current) return;
            openEquationDialog(node.attrs.latex, "inline", pos);
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            if (!editorRef.current) return;
            openEquationDialog(node.attrs.latex, "block", pos);
          },
        },
      }),
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 50,
          minHeight: 50,
        },
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: 5 * 1024 * 1024, // 5MB
        limit: 3,
        upload: async (file, onProgress, abortSignal) => {
          // Import the upload handler from tiptap-utils
          const { handleImageUpload } = await import("@/lib/tiptap-utils");
          return handleImageUpload(file, onProgress, abortSignal);
        },
        onError: (error) => logger.error(`Upload failed:${error}`),
        onSuccess: (url) => logger.info(`Upload successful:${url}`),
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
      },
    },
    onUpdate: ({ editor }) => {
      onchange(editor.getJSON());
      // onchange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-slate-50 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Choose DOCX file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose DOCX
          </Button>
          {selectedFile && (
            <span className="text-muted-foreground truncate text-sm">{selectedFile.name}</span>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleProcessDocx}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? "Processing…" : "Process"}
          </Button>
          {importError && <span className="text-destructive text-sm">{importError}</span>}
        </div>
        {toolbarRight != null ? <div className="shrink-0">{toolbarRight}</div> : null}
      </div>
      <MenuBar editor={editor} />
      <EditorContent className="flex-1" editor={editor} />
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
    </div>
  );
}
