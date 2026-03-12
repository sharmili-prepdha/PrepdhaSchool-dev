import type { Editor } from "@tiptap/core";
import type { EditorStateSnapshot } from "@tiptap/react";

/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */

export function menuBarStateSelector(
  ctx: EditorStateSnapshot<Editor | null>
) {
  const editor = ctx.editor;

  // ✅ Guard: editor is not ready yet
  if (!editor) {
    return {
      // Text formatting
      isBold: false,
      canBold: false,
      isItalic: false,
      canItalic: false,
      isStrike: false,
      canStrike: false,
      isCode: false,
      canCode: false,
      canClearMarks: false,

      // Block types
      isParagraph: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isHeading4: false,
      isHeading5: false,
      isHeading6: false,

      // Lists and blocks
      isBulletList: false,
      isOrderedList: false,
      isCodeBlock: false,
      isBlockquote: false,

      // Multimedia & Math
      isImage: false,
      isImageUpload: false,
      isYoutube: false,
      isTable: false,
      isInlineMath: false,
      isBlockMath: false,

      // History
      canUndo: false,
      canRedo: false,
    };
  }

  // ✅ Safe usage: editor is guaranteed to exist here
  return {
    // Text formatting
    isBold: editor.isActive("bold"),
    canBold: editor.can().chain().toggleBold().run(),

    isItalic: editor.isActive("italic"),
    canItalic: editor.can().chain().toggleItalic().run(),

    isStrike: editor.isActive("strike"),
    canStrike: editor.can().chain().toggleStrike().run(),

    isCode: editor.isActive("code"),
    canCode: editor.can().chain().toggleCode().run(),

    canClearMarks: editor.can().chain().unsetAllMarks().run(),

    // Block types
    isParagraph: editor.isActive("paragraph"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
    isHeading4: editor.isActive("heading", { level: 4 }),
    isHeading5: editor.isActive("heading", { level: 5 }),
    isHeading6: editor.isActive("heading", { level: 6 }),

    // Multimedia & Math
    isImage: editor.isActive("image"),
    isImageUpload: editor.isActive("imageUpload"),
    isYoutube: editor.isActive("youtube"),
    isTable: editor.isActive("table"),
    isInlineMath: editor.isActive("inlineMath"),
    isBlockMath: editor.isActive("blockMath"),

    // Lists and blocks
    isBulletList: editor.isActive("bulletList"),
    isOrderedList: editor.isActive("orderedList"),
    isCodeBlock: editor.isActive("codeBlock"),
    isBlockquote: editor.isActive("blockquote"),

    // History
    canUndo: editor.can().chain().undo().run(),
    canRedo: editor.can().chain().redo().run(),
  };
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>;
