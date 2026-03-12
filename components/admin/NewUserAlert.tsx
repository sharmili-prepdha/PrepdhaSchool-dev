"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type NewUserAlertProps = {
  state: {
    success: boolean;
    newId?: string | number;
    name?: string;
    role?: string;
    password?: string;
    loginId?: string;
  };
};

export default function NewUserAlert({
  state,
  onUpdate,
}: NewUserAlertProps & { onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasShownRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (state.success && state.password && state.newId !== hasShownRef.current) {
      const timeout = setTimeout(() => {
        setOpen(true);
        setCopied(false);
        onUpdate();
        hasShownRef.current = state.newId ?? null;
      }, 0);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleCopy = () => {
    const text = `Login ID: ${state.loginId}\nName: ${state.name}\nRole: ${state.role}\nPassword: ${state.password}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
      })
      .catch(() => {
        // If clipboard write fails, ensure user still gets feedback
        alert("Failed to copy details. Please try again.");
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New User Created</DialogTitle>
          <DialogDescription className="text-red-500 font-bold">
            Warning: These details will only be shown once. Please copy them immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="font-semibold">Login ID:</span>
            <span>{state.loginId}</span>
            <span className="font-semibold">Name:</span>
            <span>{state.name}</span>
            <span className="font-semibold">Role:</span>
            <span>{state.role}</span>
            <span className="font-semibold">Password:</span>
            <span className="font-mono bg-muted p-1 rounded">{state.password}</span>
          </div>
          <div className="space-y-2">
            <Button onClick={handleCopy} className="w-full">
              <Copy className="mr-2 h-4 w-4" /> Copy Details
            </Button>
            {copied && (
              <Alert>
                <AlertDescription>Details copied to clipboard.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
