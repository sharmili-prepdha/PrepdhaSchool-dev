import type { JSONContent } from "@tiptap/react";

/**
 * Metadata for a single textbook page.
 * Used to identify and retrieve pages e.g. "6th class Science, Chapter 1, Page 1".
 */
export type TextbookPageMetadata = {
  /** Class/grade e.g. 6 for "6th class" */
  grade: number | null;
  /** Subject name e.g. "Science" */
  subject: string | null;
  /** Textbook or book title (optional) */
  textbookName: string | null;
  /** Chapter identifier e.g. "1" or "1.1" */
  chapter: string | null;
  /** Page number within the chapter (same as page id) */
  pageNumber: number | null;
  /** Chapter name (e.g. "Food: Where Does It Come From?") */
  title: string | null;
};

/**
 * Format used to store rich text from the editor.
 * Full TipTap JSON is stored on Page.content_json.
 *
 * - Save: get JSON from editor → saveDocument({ pageId, content }).
 * - Load: loadDocument({ pageId }) → returns content + metadata.
 */
export type StoredRichTextContent = JSONContent;

/**
 * Loaded page: editor content plus textbook-page metadata for display and re-save.
 */
export type LoadedTextbookPage = {
  content: JSONContent;
  metadata: TextbookPageMetadata;
  pageId: number;
};

/**
 * User highlight annotation: ProseMirror position range [from_pos, to_pos).
 * Stored per user per page; merged into base content at render time.
 */
export type UserHighlight = {
  fromPos: number;
  toPos: number;
  color?: string;
};
