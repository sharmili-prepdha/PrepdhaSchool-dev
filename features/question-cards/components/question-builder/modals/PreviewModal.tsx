"use client";

import JsonRenderer from "@/features/question-cards/components/question/JsonRendered";
import { X, Pencil, Trash2 } from "lucide-react";
import type { Question } from "../types";

interface PreviewModalProps {
  question: Question;
  onClose: () => void;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export function PreviewModal({ question, onClose, onEdit, onDelete }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm font-semibold text-gray-700">
            Question Preview
            <span className="ml-2 text-xs text-gray-400 font-normal bg-muted px-1.5 py-0.5 rounded">
              {question.type}
            </span>
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Question text */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Question</p>
            <div className="text-sm text-gray-900 prose prose-sm max-w-none">
              <JsonRenderer content={question.content} />
            </div>
          </div>

          {/* Options */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Options</p>
            <div className="space-y-1.5">
              {question.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-3 py-2 rounded-md text-sm border
    ${opt.isCorrect ? "border-green-400 bg-green-50" : "border-gray-200"}`}
                >
                  {opt.isCorrect && <span className="text-xs text-green-600 mr-2">✓ Correct</span>}
                  <JsonRenderer content={opt.content} />
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">Explanation</p>
              <div className="prose prose-sm max-w-none">
                <JsonRenderer content={question.explanation} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t">
          <button
            onClick={() => onDelete(question.id)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <button
            onClick={() => onEdit(question)}
            className="flex items-center gap-1.5 text-sm bg-black text-white px-4 py-1.5 rounded-md hover:bg-gray-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={onClose}
            className="text-sm px-4 py-1.5 rounded-md border hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
