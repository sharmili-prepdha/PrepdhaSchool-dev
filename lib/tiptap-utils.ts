import type { Node as PMNode } from "@tiptap/pm/model";
import { Selection, TextSelection, type Transaction } from "@tiptap/pm/state";
import type { Editor, NodeWithPos } from "@tiptap/react";
import { logger } from "./logger";

export const MAC_SYMBOLS: Record<string, string> = {
  mod: "⌘",
  command: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  control: "⌃",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  backspace: "Del",
  delete: "⌦",
  enter: "⏎",
  escape: "⎋",
  capslock: "⇪",
} as const;

export const SR_ONLY = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
} as const;

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function isMac(): boolean {
  return typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
}

export const formatShortcutKey = (key: string, isMac: boolean, capitalize: boolean = true) => {
  if (isMac) {
    const lowerKey = key.toLowerCase();
    return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key);
  }

  return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};

export const parseShortcutKeys = (props: {
  shortcutKeys: string | undefined;
  delimiter?: string;
  capitalize?: boolean;
}) => {
  const { shortcutKeys, delimiter = "+", capitalize = true } = props;

  if (!shortcutKeys) return [];

  return shortcutKeys
    .split(delimiter)
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac(), capitalize));
};

export const isMarkInSchema = (markName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.marks.get(markName) !== undefined;
};

export const isNodeInSchema = (nodeName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.nodes.get(nodeName) !== undefined;
};

export function focusNextNode(editor: Editor) {
  const { state, view } = editor;
  const { doc, selection } = state;

  const nextSel = Selection.findFrom(selection.$to, 1, true);
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
    return true;
  }

  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType) {
    logger.error("No paragraph node type found in schema.");
    return false;
  }

  const end = doc.content.size;
  const para = paragraphType.create();
  let tr = state.tr.insert(end, para);

  const $inside = tr.doc.resolve(end + 1);
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView();
  view.dispatch(tr);
  return true;
}

export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === "number" && pos >= 0;
}

export function isExtensionAvailable(
  editor: Editor | null,
  extensionNames: string | string[],
): boolean {
  if (!editor) return false;

  const names = Array.isArray(extensionNames) ? extensionNames : [extensionNames];

  const found = names.some((name) =>
    editor.extensionManager.extensions.some((ext) => ext.name === name),
  );

  if (!found) {
    logger.error(`None of the extensions [${names.join(", ")}] were found in the editor schema.`);
  }

  return found;
}

export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position);
    if (!node) {
      logger.error(`No node found at position ${position}`);
      return null;
    }
    return node;
  } catch (error) {
    logger.error(`Error getting node at position ${position}:${error}`);
    return null;
  }
}

export function findNodePosition(props: {
  editor: Editor | null;
  node?: PMNode | null;
  nodePos?: number | null;
}): { pos: number; node: PMNode } | null {
  const { editor, node, nodePos } = props;

  if (!editor || !editor.state?.doc) return null;

  const hasValidNode = node !== undefined && node !== null;
  const hasValidPos = isValidPosition(nodePos);

  if (!hasValidNode && !hasValidPos) return null;

  if (hasValidNode) {
    let foundPos = -1;
    let foundNode: PMNode | null = null;

    editor.state.doc.descendants((currentNode, pos) => {
      if (currentNode === node) {
        foundPos = pos;
        foundNode = currentNode;
        return false;
      }
      return true;
    });

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode };
    }
  }

  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!);
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos };
    }
  }

  return null;
}

/* ===========================
   ✅ UPDATED GENERICS HERE
=========================== */

export function updateNodesAttr<attrNameType extends string = string, valueType = unknown>(
  tr: Transaction,
  targets: readonly NodeWithPos[],
  attrName: attrNameType,
  next: valueType | ((prev: valueType | undefined) => valueType | undefined),
): boolean {
  if (!targets.length) return false;

  let changed = false;

  for (const { pos } of targets) {
    const currentNode = tr.doc.nodeAt(pos);
    if (!currentNode) continue;

    const prevValue = (currentNode.attrs as Record<string, unknown>)[attrName] as
      | valueType
      | undefined;

    const resolvedNext =
      typeof next === "function"
        ? (next as (p: valueType | undefined) => valueType | undefined)(prevValue)
        : next;

    if (prevValue === resolvedNext) continue;

    const nextAttrs: Record<string, unknown> = {
      ...currentNode.attrs,
    };

    if (resolvedNext === undefined) {
      delete nextAttrs[attrName];
    } else {
      nextAttrs[attrName] = resolvedNext;
    }

    tr.setNodeMarkup(pos, undefined, nextAttrs);
    changed = true;
  }

  return changed;
}

export interface HandleImageUploadProgressEvent {
  progress: number;
}

export async function handleImageUpload(
  file: File,
  onProgress?: (event: HandleImageUploadProgressEvent) => void,
  signal?: AbortSignal,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Best‑effort progress reporting; real streaming progress would require XHR.
  if (onProgress) {
    onProgress({ progress: 0 });
  }

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = (await response.json()) as { url?: string };

  if (!data.url) {
    throw new Error("Upload succeeded but no URL was returned");
  }

  if (onProgress) {
    onProgress({ progress: 100 });
  }

  return data.url;
}
