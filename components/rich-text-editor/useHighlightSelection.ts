"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { savePageHighlights } from "@/features/tiptap/actions/page-highlights.action";
import type { UserHighlight } from "@/types/rich-text.types";

export type UseHighlightSelectionOptions = {
  editor: Editor | null;
  enabled: boolean;
  pageId: number;
  highlights: UserHighlight[];
  onHighlightsChange: (highlights: UserHighlight[]) => void;
};

export type UseHighlightSelectionResult = {
  selection: { from: number; to: number } | null;
  selectedText: string;
  toolbarRect: DOMRect | null;
  handleHighlight: () => Promise<void>;
  handleUnhighlight: () => Promise<void>;
  hasOverlappingHighlights: boolean;
  handleContextMenu: (event: React.MouseEvent) => void;
  isSaving: boolean;
  saveError: string | null;
};

export function useHighlightSelection({
  editor,
  enabled,
  pageId,
  highlights,
  onHighlightsChange,
}: UseHighlightSelectionOptions): UseHighlightSelectionResult {
  const [selection, setSelection] = useState<{ from: number; to: number } | null>(null);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const clearToolbar = useCallback(() => {
    setSelection(null);
    setToolbarRect(null);
  }, []);

  const updateSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      clearToolbar();
      return;
    }
    setSelection({ from, to });
    // Do NOT set toolbarRect here — toolbar shows only on right-click
  }, [editor, clearToolbar]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) {
        clearToolbar();
        return;
      }
      event.preventDefault();
      setSelection({ from, to });
      try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        setToolbarRect(
          new DOMRect(start.left, Math.min(start.top, end.top) - 40, end.right - start.left, 8),
        );
      } catch {
        setToolbarRect(null);
      }
    },
    [editor, clearToolbar],
  );

  useEffect(() => {
    if (!editor || !enabled) return;
    updateSelection();
    editor.on("selectionUpdate", updateSelection);
    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor, enabled, updateSelection]);

  const handleHighlight = useCallback(async () => {
    if (!selection || isSaving) return;
    setSaveError(null);
    // Store ProseMirror positions as-is (0-based). apply-highlights uses 0-based.
    const newHighlight: UserHighlight = {
      fromPos: selection.from,
      toPos: selection.to,
      color: "#fef08a", // yellow-200
    };
    const merged = [...highlights, newHighlight];
    setIsSaving(true);
    try {
      const result = await savePageHighlights({
        pageId,
        highlights: merged.map((h) => ({
          fromPos: h.fromPos,
          toPos: h.toPos,
          color: h.color,
        })),
      });
      if (result.success) {
        onHighlightsChange(merged);
        setSelection(null);
        setToolbarRect(null);
      } else {
        setSaveError(result.error ?? "Failed to save highlight");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save highlight");
    } finally {
      setIsSaving(false);
    }
  }, [selection, pageId, highlights, onHighlightsChange, isSaving]);

  const handleUnhighlight = useCallback(async () => {
    if (!selection || isSaving) return;
    const overlapping = highlights.filter(
      (h) => h.fromPos < selection.to && h.toPos > selection.from,
    );
    if (overlapping.length === 0) return;
    setSaveError(null);
    const remaining = highlights.filter(
      (h) => !(h.fromPos < selection.to && h.toPos > selection.from),
    );
    setIsSaving(true);
    try {
      const result = await savePageHighlights({
        pageId,
        highlights: remaining.map((h) => ({
          fromPos: h.fromPos,
          toPos: h.toPos,
          color: h.color,
        })),
      });
      if (result.success) {
        onHighlightsChange(remaining);
        setSelection(null);
        setToolbarRect(null);
      } else {
        setSaveError(result.error ?? "Failed to remove highlight");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to remove highlight");
    } finally {
      setIsSaving(false);
    }
  }, [selection, pageId, highlights, onHighlightsChange, isSaving]);

  const hasOverlappingHighlights =
    !!selection &&
    highlights.some((h) => h.fromPos < selection.to && h.toPos > selection.from);

  const selectedText =
    editor && selection ? editor.state.doc.textBetween(selection.from, selection.to, " ") : "";

  return {
    selection,
    selectedText,
    toolbarRect,
    handleHighlight,
    handleUnhighlight,
    hasOverlappingHighlights,
    handleContextMenu,
    isSaving,
    saveError,
  };
}
