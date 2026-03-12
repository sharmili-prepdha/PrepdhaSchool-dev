"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { McqFieldEditor } from "./McqFieldEditor";

export interface McqData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface McqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: McqData) => void;
  initialData?: McqData;
}

function normalizeMcqData(raw?: McqData): McqData {
  const fallback: McqData = {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  };

  const base = raw ?? fallback;
  const options = base.options && base.options.length > 0 ? base.options : fallback.options;
  const maxIndex = Math.max(options.length - 1, 0);

  const nextCorrect =
    Number.isInteger(base.correctAnswer) && base.correctAnswer >= 0 && base.correctAnswer <= maxIndex
      ? base.correctAnswer
      : 0;

  return {
    ...base,
    options,
    correctAnswer: nextCorrect,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function hasContent(html: string): boolean {
  // Treat either visible text OR math nodes as content
  if (stripHtml(html)) return true;
  // Math-only content (inline or block) has no inner text but has data-type attributes
  return /data-type="inline-math"|data-type="block-math"/.test(html);
}

export function McqDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: McqDialogProps) {
  const [data, setData] = useState<McqData>(() => normalizeMcqData(initialData));

  useEffect(() => {
    if (!open) return;

    const nextData = normalizeMcqData(initialData);

    const timeoutId = window.setTimeout(() => {
      setData(nextData);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!hasContent(data.question)) return;
    if (data.options.some((opt) => !hasContent(opt))) return;

    onSubmit(data);
    onOpenChange(false);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    setData((prev) => ({ ...prev, options: newOptions }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit MCQ" : "Insert MCQ"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Question (supports text and math)</Label>
            <McqFieldEditor
              value={data.question}
              onChange={(value) => setData((prev) => ({ ...prev, question: value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Options (select correct answer, supports text and math)</Label>
            <RadioGroup
              value={String(data.correctAnswer)}
              onValueChange={(val) =>
                setData((prev) => ({ ...prev, correctAnswer: Number(val) }))
              }
            >
              {data.options.map((opt, i) => (
                <div key={i} className="flex items-start gap-2">
                  <RadioGroupItem
                    value={String(i)}
                    id={`opt-${i}`}
                    className="mt-6 shrink-0"
                    checked={data.correctAnswer === i}
                  />
                  <div className="flex-1 min-w-0">
                    <McqFieldEditor
                      value={opt}
                      onChange={(value) => updateOption(i, value)}
                    />
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Explanation (supports text and math)</Label>
            <McqFieldEditor
              value={data.explanation}
              onChange={(value) => setData((prev) => ({ ...prev, explanation: value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
