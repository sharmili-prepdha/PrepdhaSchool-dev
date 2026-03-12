"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { deleteUser } from "@/features/admin/actions/admin.action";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

type User = {
  id: number;
  name: string | null;
  schoolId: number;
};

type DeleteAlertProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
};

export default function DeleteUserAlert({ open, setOpen, user }: DeleteAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [usernameConfirmation, setUsernameConfirmation] = useState("");

  const displayName = user.name || `User ${user.id}`;

  const handleDelete = async () => {
    if (usernameConfirmation !== displayName) return;

    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      setOpen(false);
      redirect("/");
    } catch (error) {
      logger.error(`Error deleting user:${error}`);
    } finally {
      setIsDeleting(false);
      setUsernameConfirmation("");
    }
  };

  useEffect(() => {
    if (!open) {
      setUsernameConfirmation("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            This action cannot be undone. To confirm, please type{" "}
            <span className="font-bold text-foreground">{displayName}</span> below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type username here"
            value={usernameConfirmation}
            onChange={(e) => setUsernameConfirmation(e.target.value)}
          />
          <div className="flex justify-end gap-2 ">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <div className="cursor-not-allowed">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || usernameConfirmation !== displayName}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
