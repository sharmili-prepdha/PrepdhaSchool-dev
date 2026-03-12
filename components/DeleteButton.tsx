"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeleteButton({
  action,
  id,
  schoolName,
}: {
  action: (formData: FormData) => Promise<void> | void;
  id: number;
  schoolName: string;
}) {
  const [show, setShow] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isMatch = confirmText.trim().toLowerCase() === schoolName.trim().toLowerCase();

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete School</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All data associated with <strong>{schoolName}</strong>{" "}
            will be permanently removed.
            <br />
            <br />
            To confirm, type <strong>{schoolName}</strong> below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          action={async (formData) => {
            if (!isMatch) return;
            await action(formData);
            setShow(false);
            setConfirmText("");
          }}
        >
          <input type="hidden" name="id" value={id} />

          <div className="py-2">
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type ${schoolName} to confirm`}
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!isMatch) {
                    e.preventDefault();
                  }
                }
              }}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              onClick={() => {
                setShow(false);
                setConfirmText("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            {/* Enabled submission via Enter key by wrapping in form and using type="submit" */}
            <Button
              type="submit"
              variant="destructive"
              disabled={!isMatch}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
