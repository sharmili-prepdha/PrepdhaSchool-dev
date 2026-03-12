"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createChapter } from "@/features/contentMetadata/actions/metadata.actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
};

export function AddChapterDialog({ open, onOpenChange, bookId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await createChapter(bookId, name);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setTitle("");
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle("");
      mutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add chapter</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="chapter-title">Name</Label>
          <Input
            id="chapter-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction"
          />
          {mutation.isError && (
            <p className="text-sm text-destructive">{mutation.error?.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !title.trim()}
          >
            {mutation.isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
