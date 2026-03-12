"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import type { Question, GroupedQuestions } from "./types";
import type { QuestionType } from "@/app/generated/prisma/enums";
import { JSONContent } from "@tiptap/core";

interface SidebarProps {
  grouped: GroupedQuestions;
  selectedId: string | null;
  onStartCreate: (type: QuestionType) => void;
  onEditQuestion: (question: Question) => void;
  onPreviewQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
}

const SECTIONS: { type: QuestionType; label: string }[] = [
  { type: "MCQ", label: "MCQ" },
  { type: "MSQ", label: "MSQ" },
  { type: "TRUE_FALSE", label: "True / False" },
];

function extractPlainText(json: JSONContent): string {
  if (!json || !json.content) return "Untitled";
  const texts: string[] = [];
  function walk(node: JSONContent) {
    if (node.type === "text") texts.push(node.text ?? "");
    if (node.content) node.content.forEach(walk);
  }
  walk(json);
  return texts.join("").trim().slice(0, 60) || "Untitled";
}

export function Sidebar({
  grouped,
  selectedId,
  onStartCreate,
  onEditQuestion,
  onPreviewQuestion,
  onDeleteQuestion,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (type: string) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex flex-col gap-1 p-2">
      {SECTIONS.map(({ type, label }) => {
        const questions = grouped[type];
        const isCollapsed = collapsed[type];

        return (
          <div key={type} className="border rounded-md">
            {/* Section Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/40 cursor-pointer select-none">
              <button
                className="flex items-center gap-1.5 text-sm font-medium flex-1 text-left"
                onClick={() => toggleSection(type)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
                {label}
                <span className="ml-1 text-sm text-gray-400">
                  ({questions.length})
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCreate(type);
                }}
                className="p-1 rounded hover:bg-muted text-gray-500 hover:text-gray-900"
                title={`Create new ${label}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Question List */}
            {!isCollapsed && (
              <div className="flex flex-col">
                {questions.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">
                    No questions yet
                  </p>
                )}
                {questions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    isSelected={q.id === selectedId}
                    onEdit={onEditQuestion}
                    onPreview={onPreviewQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface QuestionRowProps {
  question: Question;
  isSelected: boolean;
  onEdit: (q: Question) => void;
  onPreview: (q: Question) => void;
  onDelete: (id: string) => void;
}

function QuestionRow({
  question,
  isSelected,
  onEdit,
  onPreview,
  onDelete,
}: QuestionRowProps) {
  const preview = extractPlainText(question.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(question);
    setMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(question.id);
    setMenuOpen(false);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(question);
    setMenuOpen(false);
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-sm border-t group cursor-pointer
        ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-muted/50"}`}
    >
      {/* Click row to preview */}
      <span
        className="flex-1 truncate"
        onClick={() => onPreview(question)}
        title={preview}
      >
        {preview}
      </span>

      {/* Menu Container */}
      <div ref={menuRef} className="relative shrink-0">
        {/* Kebab Menu Icon */}
        <button
          onClick={handleMenuClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-gray-400 hover:text-gray-700 transition-opacity duration-150"
          title="Actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-max">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 border-b border-gray-100 cursor-pointer"
            >
              <Eye className="h-3 w-3 text-gray-400" />
              Preview
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 border-b border-gray-100 cursor-pointer"
            >
              <Pencil className="h-3 w-3 text-gray-400" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-100 cursor-pointer"
            >
              <Trash2 className="h-3 w-3 text-red-400" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
