import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEquation: string;
  onSubmit: (equation: string) => void;
  title?: string;
  submitButtonText?: string;
}

export function EquationEditDialog({
  open,
  onOpenChange,
  initialEquation,
  onSubmit,
  title = "Edit Equation",
  submitButtonText = "Save",
}: EquationEditDialogProps) {
  const [equation, setEquation] = useState(initialEquation);
 const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEquation(initialEquation);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (equation.trim()) {
      onSubmit(equation);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="equation">LaTeX Equation</Label>
            <Input
              id="equation"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter LaTeX equation (e.g., E=mc^2)"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Use $ for inline math or $$ for block math. Press Ctrl+Enter to save.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{submitButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
