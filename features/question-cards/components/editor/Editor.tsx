"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { getExtensions } from "./extensions";

interface EditorProps {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Editor({
  value,
  onChange,
  placeholder = "Type here...",
  disabled = false,
}: EditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function initialize() {
      setMounted(true);
    }
    initialize();
  }, []);

  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // We use @tailwindcss/typography (prose) to handle formatting automatically
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Keep content in sync if updated from outside (e.g., fetching drafts)
  useEffect(() => {
    if (!editor) return;

    const currentContent = JSON.stringify(editor.getJSON());
    const newContent = JSON.stringify(value);

    if (currentContent !== newContent) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) {
    return <div className="min-h-50 border rounded-md animate-pulse bg-muted/50" />; // Loading skeleton
  }

  return (
    <div
      className={`border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
