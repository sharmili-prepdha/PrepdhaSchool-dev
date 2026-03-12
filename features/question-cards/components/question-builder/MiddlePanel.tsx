"use client";

import {
  CheckSquare,
  Square,
  Circle,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import type { Draft, EditingField } from "./types";
import type { QuestionType } from "@/app/generated/prisma/enums";
import { JSONContent } from "@tiptap/core";

interface MiddlePanelProps {
  type: QuestionType;
  draft: Draft;
  editingField: EditingField;
  isSaving: boolean;
  mode: "create" | "edit";
  hasUnsavedChanges: boolean;
  onSelectField: (field: EditingField) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onToggleCorrect: (index: number) => void;
  onSave: () => void;
  saveError: string | null;
}

function extractPlainText(json: JSONContent): string {
  if (!json?.content) return "";
  const texts: string[] = [];
  function walk(node: JSONContent) {
    if (node.type === "text") texts.push(node.text ?? "");
    if (node.content) node.content.forEach(walk);
  }
  walk(json);
  return texts.join("").trim().slice(0, 80) || "";
}

function BlockButton({
  label,
  preview,
  isActive,
  onClick,
}: {
  label: string;
  preview?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors
        ${
          isActive
            ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
            : "border-gray-200 hover:border-gray-300 hover:bg-muted/30"
        }`}
    >
      <span className="font-medium text-xs uppercase tracking-wide text-gray-400 block mb-0.5">
        {label}
      </span>
      {preview ? (
        <span className="text-gray-700 truncate block">{preview}</span>
      ) : (
        <span className="text-gray-300 italic">Empty — click to edit</span>
      )}
    </button>
  );
}

export function MiddlePanel({
  type,
  draft,
  editingField,
  isSaving,
  mode,
  hasUnsavedChanges,
  onSelectField,
  onAddOption,
  onRemoveOption,
  onToggleCorrect,
  onSave,
  saveError,
}: MiddlePanelProps) {
  const isFieldActive = (field: EditingField) => {
    if (!field || !editingField) return false;
    if (field.type !== editingField.type) return false;
    if (field.type === "option" && editingField.type === "option") {
      return field.optionIndex === editingField.optionIndex;
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto">
      <h2 className="text-sm font-semibold text-gray-600 mb-1">
        {type === "MCQ"
          ? "Multiple Choice"
          : type === "MSQ"
            ? "Multiple Select"
            : "True / False"}
      </h2>

      {/* Question block */}
      <BlockButton
        label="Question"
        preview={extractPlainText(draft.content)}
        isActive={isFieldActive({ type: "question" })}
        onClick={() => onSelectField({ type: "question" })}
      />

      {/* Options */}
      {type !== "TRUE_FALSE" ? (
        <div className="flex flex-col gap-2">
          {draft.options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Correct toggle */}
              <button
                onClick={() => onToggleCorrect(index)}
                className="shrink-0 text-gray-400 hover:text-green-600"
                title={opt.isCorrect ? "Mark incorrect" : "Mark correct"}
              >
                {type === "MCQ" ? (
                  opt.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )
                ) : opt.isCorrect ? (
                  <CheckSquare className="h-4 w-4 text-green-500" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>

              {/* Option block */}
              <div className="flex-1">
                <BlockButton
                  label={`Option ${index + 1}`}
                  preview={extractPlainText(opt.content)}
                  isActive={isFieldActive({
                    type: "option",
                    optionIndex: index,
                  })}
                  onClick={() =>
                    onSelectField({ type: "option", optionIndex: index })
                  }
                />
              </div>

              {/* Remove (if > 2 options) */}
              {draft.options.length > 2 && (
                <button
                  onClick={() => onRemoveOption(index)}
                  className="shrink-0 text-gray-300 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={onAddOption}
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 px-2 py-1 w-fit"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Option
          </button>
        </div>
      ) : (
        /* True / False fixed options */
        <div className="flex flex-col gap-2">
          {draft.options.map((opt, index) => {
            const label = index === 0 ? "True" : "False";
            return (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => onToggleCorrect(index)}
                  className="shrink-0 text-gray-400 hover:text-green-600"
                >
                  {opt.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <div
                  className={`flex-1 px-4 py-3 rounded-md border text-sm
                  ${opt.isCorrect ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation block */}
      <BlockButton
        label="Explanation (optional)"
        preview={
          draft.explanation ? extractPlainText(draft.explanation) : undefined
        }
        isActive={isFieldActive({ type: "explanation" })}
        onClick={() => onSelectField({ type: "explanation" })}
      />

      {/* Error message */}
      {saveError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
          {saveError}
        </div>
      )}

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving || !hasUnsavedChanges}
        className="mt-2 w-full rounded-md bg-black text-white text-sm py-2.5 font-medium
          hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving
          ? mode === "create"
            ? "Creating..."
            : "Editing..."
          : mode === "create"
            ? "Create Question"
            : "Edit Question"}
      </button>
    </div>
  );
}
