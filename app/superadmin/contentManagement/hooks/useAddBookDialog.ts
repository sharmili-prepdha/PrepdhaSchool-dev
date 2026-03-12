"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBook } from "@/features/contentMetadata/actions/metadata.actions";
type AddBookDialogState = {
  isOpen: boolean;
  title: string;
  isPending: boolean;
  error: string | null;
};

type AddBookDialogActions = {
  open: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  submit: (classSubjectId: number, title: string) => Promise<boolean>;
};

export function useAddBookDialog(): AddBookDialogState & AddBookDialogActions {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setIsOpen(false);
    setTitle("");
    setError(null);
  };

  const submit = async (classSubjectId: number, bookTitle: string): Promise<boolean> => {
    const trimmed = bookTitle.trim();
    if (!trimmed) return false;

    setIsPending(true);
    setError(null);
    const result = await createBook(classSubjectId, trimmed);
    setIsPending(false);

    if (result.success) {
      close();
      router.refresh();
      return true;
    }
    setError(result.error);
    return false;
  };

  return {
    isOpen,
    title,
    isPending,
    error,
    open: () => setIsOpen(true),
    close,
    setTitle,
    submit,
  };
}
