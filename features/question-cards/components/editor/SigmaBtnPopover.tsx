"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Sigma, Check, X } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MATH_EXAMPLES = ["E=mc^2", "\\frac{a}{b}", "\\sqrt{x}", "x^2+y^2", "H_2O"];

interface SigmaBtnPopoverProps {
  editor: Editor;
}

export function SigmaBtnPopover({ editor }: SigmaBtnPopoverProps) {
  const [open, setOpen] = useState(false);
  const [latexInput, setLatexInput] = useState("");

  const insertMath = () => {
    if (!latexInput.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: "inlineMath", attrs: { latex: latexInput.trim() } })
      .run();
    setLatexInput("");
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setLatexInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") insertMath();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Toggle 
        // size="sm" 
        pressed={open} aria-label="Insert math equation">
          <Sigma className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Insert LaTeX Math Expression
          </p>
          <Input
            autoFocus
            placeholder="e.g. E=mc^2, \frac{a}{b}, \sqrt{x}"
            value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm font-mono"
          />
          {/* Quick examples */}
          <div className="flex flex-wrap gap-1">
            {MATH_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setLatexInput(example)}
                className="text-xs px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 font-mono transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={insertMath}
              disabled={!latexInput.trim()}
            >
              <Check className="h-3 w-3 mr-1" />
              Insert
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}