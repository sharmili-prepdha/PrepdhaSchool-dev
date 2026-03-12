"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useState, useId } from "react";
import { Pencil } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { McqDialog } from "./McqDialog";
import { MathContentRenderer } from "./MathContentRenderer";

type McqAttrs = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export const McqNodeView = ({ node, updateAttributes, editor }: ReactNodeViewProps) => {
  const attrs = node.attrs as McqAttrs;
  const question = attrs.question ?? "";
  const options = Array.isArray(attrs.options) ? attrs.options : ["", "", "", ""];
  const correctAnswer = Number(attrs.correctAnswer) || 0;
  const explanation = attrs.explanation ?? "";
  const isEditable = editor.isEditable;
  const id = useId();

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <NodeViewWrapper>
      <McqDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={{
          question,
          options,
          correctAnswer,
          explanation,
        }}
        onSubmit={(data) => updateAttributes(data)}
      />

      <Card className="my-4 border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="font-semibold text-lg">
            <MathContentRenderer html={question} />
          </div>
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
              title="Edit MCQ"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <RadioGroup
            disabled={submitted}
            onValueChange={(val) => setSelected(val)}
            value={selected || undefined}
          >
            {options.map((opt: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={String(i)} id={`option-${i}-${id}`} />
                <label
                  htmlFor={`option-${i}-${id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <MathContentRenderer html={opt} />
                </label>
              </div>
            ))}
          </RadioGroup>

          {/* SUBMIT BUTTON */}
          {!submitted && (
            <Button
              className="mt-2"
              onClick={() => setSubmitted(true)}
              disabled={selected === null}
            >
              Submit
            </Button>
          )}

          {/* RESULT */}
          {submitted && (
            <div className="space-y-2 mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Correct Answer:</span>
                <div className="rounded-md border border-input bg-background px-2 py-1 font-normal">
                  <MathContentRenderer html={options[correctAnswer] ?? ""} className="not-prose" />
                </div>
              </div>

              {String(correctAnswer) === selected ? (
                <div className="text-green-600 font-medium text-sm">Correct!</div>
              ) : (
                <div className="text-red-600 font-medium text-sm">Incorrect</div>
              )}

              <div className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">Explanation: </span>
                <span>
                  <MathContentRenderer html={explanation} />
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setSelected(null);
                }}
                className="mt-2"
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};
