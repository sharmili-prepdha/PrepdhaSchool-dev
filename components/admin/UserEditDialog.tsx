"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect } from "react";
import { updateUser } from "@/features/admin/actions/admin.action";

type User = {
  id: number;
  name: string | null;
  role: string;
};

type UserEditDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
  schoolId: number;
};

type UpdateUserState = {
  success: boolean;
  error: string;
};

const initialState: UpdateUserState = {
  success: false,
  error: "",
};

export default function UserEditDialog({ open, setOpen, user, schoolId }: UserEditDialogProps) {
  const [state, formAction, isPending] = useActionState(updateUser, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user&apos;s details.</DialogDescription>
          </DialogHeader>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="schoolId" value={schoolId} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                defaultValue={user.name ?? ""}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <select
                id="role"
                name="role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                defaultValue={user.role}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="principal">Principal</option>
              </select>
            </div>
          </div>
          {state.error && <p className="text-red-500 text-sm mb-4">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
