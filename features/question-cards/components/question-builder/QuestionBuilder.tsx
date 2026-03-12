"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import {
  type Question,
  type Draft,
  type EditingField,
  type PendingAction,
  type GroupedQuestions,
  EMPTY_DOC,
  buildDefaultDraft,
  questionToDraft,
  groupQuestions,
  searchQuestions,
} from "./types";
import type { QuestionType } from "@/app/generated/prisma/enums";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/features/question-cards/actions/questoin.actions";
import { SearchNavbar } from "./SearchNavbar";
import { Sidebar } from "./Sidebar";
import { MiddlePanel } from "./MiddlePanel";
import { Editor } from "@/features/question-cards/components/editor/Editor";
import { PreviewModal } from "./modals/PreviewModal";
import { UnsavedModal } from "./modals/UnsavedModal";
import { DeleteModal } from "./modals/DeleteModal";

interface QuestionBuilderProps {
  topicId: number;
  initialQuestions: Question[];
}

export function QuestionBuilder({ topicId, initialQuestions }: QuestionBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Core state ──────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draft, setDraft] = useState<Draft>({
    content: EMPTY_DOC,
    explanation: null,
    options: [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ── Modal state ──────────────────────────────────────────────────
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [unsavedPending, setUnsavedPending] = useState<PendingAction | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ── Search state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── Derived ──────────────────────────────────────────────────────
  const filteredQuestions = searchQuery ? searchQuestions(questions, searchQuery) : questions;
  const grouped: GroupedQuestions = groupQuestions(filteredQuestions);

  // ── Editor value ─────────────────────────────────────────────────
  const editorValue: JSONContent = (() => {
    if (!editingField) return EMPTY_DOC;
    if (editingField.type === "question") return draft.content;
    if (editingField.type === "explanation") return draft.explanation ?? EMPTY_DOC;
    if (editingField.type === "option")
      return draft.options[editingField.optionIndex]?.content ?? EMPTY_DOC;
    return EMPTY_DOC;
  })();

  const editorLabel = (() => {
    if (!editingField) return "Select a field to edit";
    if (editingField.type === "question") return "Editing Question";
    if (editingField.type === "explanation") return "Editing Explanation";
    if (editingField.type === "option") return `Editing Option ${editingField.optionIndex + 1}`;
    return "";
  })();

  // ── Guard: run action or show unsaved modal ───────────────────────
  const guardedAction = useCallback(
    (action: PendingAction) => {
      if (hasUnsavedChanges) {
        setUnsavedPending(() => action);
      } else {
        action();
      }
    },
    [hasUnsavedChanges],
  );

  // ── Start create mode ─────────────────────────────────────────────
  const handleStartCreate = useCallback(
    (type: QuestionType) => {
      guardedAction(() => {
        setMode("create");
        setSelectedId(null);
        setSelectedType(type);
        setDraft(buildDefaultDraft(type));
        setEditingField({ type: "question" });
        setHasUnsavedChanges(false);
      });
    },
    [guardedAction],
  );

  // ── Select question for editing ────────────────────────────────────
  const handleSelectForEdit = useCallback(
    (question: Question) => {
      guardedAction(() => {
        setMode("edit");
        setSelectedId(question.id);
        setSelectedType(question.type);
        setDraft(questionToDraft(question));
        setEditingField({ type: "question" });
        setHasUnsavedChanges(false);
      });
    },
    [guardedAction],
  );

  // ── Editor onChange ────────────────────────────────────────────────
  const handleEditorChange = useCallback(
    (value: JSONContent) => {
      if (!editingField) return;
      setHasUnsavedChanges(true);
      setSaveError(null); // clear error on new input
      if (editingField.type === "question") {
        setDraft((prev) => ({ ...prev, content: value }));
      } else if (editingField.type === "explanation") {
        setDraft((prev) => ({ ...prev, explanation: value }));
      } else if (editingField.type === "option") {
        const idx = editingField.optionIndex;
        setDraft((prev) => ({
          ...prev,
          options: prev.options.map((opt, i) => (i === idx ? { ...opt, content: value } : opt)),
        }));
      }
    },
    [editingField],
  );

  // ── Option handlers ────────────────────────────────────────────────
  const handleAddOption = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      options: [...prev.options, { content: EMPTY_DOC, isCorrect: false }],
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleRemoveOption = useCallback((index: number) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleToggleCorrect = useCallback(
    (index: number) => {
      setDraft((prev) => ({
        ...prev,
        options: prev.options.map((opt, i) => {
          if (selectedType === "MCQ") {
            return { ...opt, isCorrect: i === index };
          }
          // MSQ and TRUE_FALSE: toggle
          return i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt;
        }),
      }));
      setHasUnsavedChanges(true);
    },
    [selectedType],
  );

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!selectedType) return;

    startTransition(() => {
      void (async () => {
        try {
          if (mode === "create") {
            const newQuestion = await createQuestion({
              topicId,
              type: selectedType,
              // Stringify so React's flight serializer passes the JSON untouched
              // (plain objects can have attrs like textAlign stripped during serialization)
              content: JSON.stringify(draft.content),
              explanation: draft.explanation ? JSON.stringify(draft.explanation) : null,
              options: draft.options.map((opt) => ({
                content: JSON.stringify(opt.content),
                isCorrect: opt.isCorrect,
              })),
            });

            // Optimistically update local list
            setQuestions((prev) => [...prev, newQuestion as unknown as Question]);
            setMode("edit");
            setSelectedId(newQuestion.id);
            setHasUnsavedChanges(false);
          } else if (mode === "edit" && selectedId) {
            await updateQuestion({
              id: selectedId,
              content: JSON.stringify(draft.content),
              explanation: draft.explanation ? JSON.stringify(draft.explanation) : null,
              options: draft.options.map((opt) => ({
                content: JSON.stringify(opt.content),
                isCorrect: opt.isCorrect,
              })),
            });

            // Optimistically update local list
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === selectedId
                  ? {
                      ...q,
                      content: draft.content,
                      explanation: draft.explanation,
                      options: draft.options.map((o, i) => ({
                        ...o,
                        id: o.id ?? "",
                        displayOrder: i,
                      })),
                    }
                  : q,
              ),
            );
            setHasUnsavedChanges(false);
          }
          setSaveError(null); // clear any previous errors
          router.refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Save failed";
          setSaveError(message);
        }
      })(); // async call
    });
  }, [mode, selectedId, selectedType, draft, topicId, router]);

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTargetId) return;
    startTransition(() => {
      void (async () => {
        await deleteQuestion(deleteTargetId);
        setQuestions((prev) => prev.filter((q) => q.id !== deleteTargetId));
        if (selectedId === deleteTargetId) {
          setSelectedId(null);
          setSelectedType(null);
          setDraft({ content: EMPTY_DOC, explanation: null, options: [] });
          setEditingField(null);
          setHasUnsavedChanges(false);
        }
        setDeleteTargetId(null);
        router.refresh();
      })();
    });
  }, [deleteTargetId, selectedId, router]);

  // ── Unsaved modal actions ──────────────────────────────────────────
  const handleUnsavedSave = useCallback(() => {
    void handleSave();
    setUnsavedPending(null);
  }, [handleSave]);

  const handleUnsavedDiscard = useCallback(() => {
    setHasUnsavedChanges(false);
    const action = unsavedPending;
    setUnsavedPending(null);
    action?.();
  }, [unsavedPending]);

  const handleUnsavedCancel = useCallback(() => {
    setUnsavedPending(null);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <SearchNavbar
        topicId={topicId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Sidebar */}
        <div className="w-64 border-r overflow-y-auto shrink-0">
          <Sidebar
            grouped={grouped}
            selectedId={selectedId}
            onStartCreate={handleStartCreate}
            onEditQuestion={handleSelectForEdit}
            onPreviewQuestion={(q) => setPreviewQuestion(q)}
            onDeleteQuestion={(id) => setDeleteTargetId(id)}
          />
        </div>

        {/* MIDDLE: Builder */}
        <div className="flex-1 border-r overflow-y-auto p-4">
          {selectedType ? (
            <MiddlePanel
              type={selectedType}
              draft={draft}
              editingField={editingField}
              isSaving={isPending}
              mode={mode}
              hasUnsavedChanges={hasUnsavedChanges}
              onSelectField={setEditingField}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              onToggleCorrect={handleToggleCorrect}
              onSave={handleSave}
              saveError={saveError}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Select a question or click + to create one
            </div>
          )}
        </div>

        {/* RIGHT: Editor */}
        <div className="w-[40%] shrink-0 flex flex-col overflow-hidden p-4">
          {editingField ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{editorLabel}</p>
              <div className="flex-1 overflow-y-auto p-1">
                <Editor
                  key={`${selectedId ?? "new"}-${editingField.type}-${editingField.type === "option" ? editingField.optionIndex : ""}`}
                  value={editorValue}
                  onChange={handleEditorChange}
                  placeholder={
                    editingField.type === "question"
                      ? "Type your question here. Use $ for inline math (e.g., $E=mc^2$)..."
                      : editingField.type === "explanation"
                        ? "Explain the step-by-step solution..."
                        : `Write Option ${editingField.type === "option" ? editingField.optionIndex + 1 : ""} text or image...`
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Click a block to start editing
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {previewQuestion && (
        <PreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          onEdit={(q) => {
            setPreviewQuestion(null);
            guardedAction(() => handleSelectForEdit(q));
          }}
          onDelete={(id) => {
            setPreviewQuestion(null);
            setDeleteTargetId(id);
          }}
        />
      )}

      {unsavedPending && (
        <UnsavedModal
          onSave={handleUnsavedSave}
          onDiscard={handleUnsavedDiscard}
          onCancel={handleUnsavedCancel}
        />
      )}

      {deleteTargetId && (
        <DeleteModal onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTargetId(null)} />
      )}
    </div>
  );
}
