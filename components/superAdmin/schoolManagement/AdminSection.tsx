"use client";

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdmin, deleteAdmin, updateAdmin } from "@/features/schoolManagement/actions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  MoreVertical,
  Shield,
  Copy,
  Check,
  Trash2,
  Edit2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { logger } from "@/lib/logger";

type AdminUser = {
  id: number;
  userName: string;
  role: string;
  loginId: string;
};

type Props = {
  schoolId: number;
  existingAdmin: AdminUser | null;
};

// ─── Credentials Dialog ───────────────────────────────────────────────────────
// Lives in the parent so it is never destroyed by revalidatePath.
function CredentialsDialog({
  credentials,
  open,
  onClose,
}: {
  credentials: { id: number; userName: string; password: string, loginId: string } | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    if (!credentials) return;
    const textToCopy = `Name: ${credentials.userName}\n LoginId: ${credentials.loginId}\n Password: ${credentials.password}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (err) {
      logger.warn(`Modern clipboard API failed ${err}`);
    }

    // We keep it inside the dialog to avoid Radix UI's focus trap issues
    if (textAreaRef.current) {
      textAreaRef.current.value = textToCopy;
      textAreaRef.current.focus();
      textAreaRef.current.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (err) {
        logger.error(`Fallback copy failed ${err}`);
      }
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent className="max-w-md">
        {/* Hidden textarea for copy fallback, placed inside the dialog to work with focus traps */}
        <textarea
          ref={textAreaRef}
          aria-hidden="true"
          readOnly
          className="absolute opacity-0 -z-10 h-0 w-0"
        />
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-emerald-700">
            <Check className="w-5 h-5" /> Admin Created Successfully
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm font-medium text-amber-700">
                Save these credentials now — the password cannot be retrieved later.
              </p>
              <div className="grid grid-cols-[80px_1fr] gap-2 text-sm bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <span className="font-semibold text-emerald-900">Name</span>
                <span className="text-emerald-800">{credentials?.userName}</span>
                <span className="font-semibold text-emerald-900">Login Id</span>
                <span className="text-emerald-800">{credentials?.loginId}</span>
                <span className="font-semibold text-emerald-900">Password</span>
                <code className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-950 font-mono font-bold">
                  {credentials?.password}
                </code>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Keep this information secure and do not share it publicly.</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" /> Copy Credentials
              </>
            )}
          </Button>
          <Button className="w-full cursor-pointer" onClick={onClose}>
            Done
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Create Admin Form ────────────────────────────────────────────────────────
const createInitialState = {
  success: false,
  error: "",
  userName: "",
  password: "",
  id: 0,
  loginId: ""
};

function CreateAdminForm({
  schoolId,
  onCreated,
}: {
  schoolId: number;
  onCreated: (userName: string, password: string, id: number, loginId: string) => void;
}) {
  const createForSchoolId = createAdmin.bind(null, schoolId);
  const [state, formAction, isPending] = useActionState(createForSchoolId, createInitialState);

  // useEffect is the correct place to react to a state change and fire side-effects.
  // This runs AFTER the render, which means it won't violate React's rules.
  // We call onCreated which updates state in AdminSection — that component persists
  // even after revalidatePath causes this form to be swapped out.
  useEffect(() => {
    if (state.success && state.userName && state.password && state.id) {
      onCreated(state.userName, state.password, state.id, state.loginId);
    }
  }, [state.success, state.loginId, state.userName, state.password, state.id, onCreated]);

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="admin-name" className="text-sm font-semibold">
          Admin Name
        </Label>
        <Input
          id="admin-name"
          name="user_name"
          type="text"
          required
          placeholder="Enter full name"
          className="focus-visible:ring-primary"
        />
      </div>
      {state.error && <p className="text-xs font-bold text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
        {isPending ? (
          "Creating…"
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" /> Create Admin
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Admin Display ────────────────────────────────────────────────────────────
function AdminDisplay({ admin, schoolId }: { admin: AdminUser; schoolId: number }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(admin.userName);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const result = await deleteAdmin(admin.id, schoolId);
      if (!result.success) setError(result.error ?? "Delete failed.");
    });
  };

  const handleUpdate = () => {
    setError("");
    startTransition(async () => {
      const result = await updateAdmin(admin.id, schoolId, editedName);
      if (result.success) {
        setEditMode(false);
      } else {
        setError(result.error ?? "Update failed.");
      }
    });
  };

  const isMatch = confirmName === admin.userName;

  return (
    <>
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {admin.userName?.charAt(0).toUpperCase() ?? "T_T"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                {editMode ? (
                  <div className="flex gap-2">
                    <Input
                      className="h-8 py-1"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isPending}
                      className="cursor-pointer"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditedName(admin.userName);
                      }}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg">{admin.userName}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Administrator
                    </CardDescription>
                  </>
                )}
              </div>
            </div>

            {!editMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditMode(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setDeleteOpen(true);
                      setConfirmName("");
                      setError("");
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              ID: {admin.id}
            </Badge>
             <Badge variant="outline" className="font-mono text-[10px]">
                Login: {admin.loginId}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none"
            >
              Active
            </Badge>
          </div>
          {error && <p className="text-xs font-bold text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the admin account for <strong>{admin.userName}</strong>.
              The user will no longer be able to log in.
              <br />
              <br />
              Please type <strong>{admin.userName}</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Type admin name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (isMatch && !isPending) {
                    handleDelete();
                  }
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmName("")} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!isMatch || isPending}
              onClick={handleDelete}
              className="cursor-pointer"
            >
              {isPending ? "Removing…" : "Confirm Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Admin Section ─────────────────────────────────
export default function AdminSection({ schoolId, existingAdmin }: Props) {
  const router = useRouter();

  // These live in AdminSection so they survive the CreateAdminForm → AdminDisplay swap
  // that happens when revalidatePath fires after a successful admin creation.
  const [createdCredentials, setCreatedCredentials] = useState<{
    id: number;
    userName: string;
    password: string;
    loginId: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdminCreated = useCallback((userName: string, password: string, id: number, loginId: string) => {
    setCreatedCredentials({ id, userName, password, loginId });
    setDialogOpen(true);
  }, []);

  const handleDialogClose = () => {
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* Credentials dialog — always mounted here, never lost during remounts */}
      <CredentialsDialog
        credentials={createdCredentials}
        open={dialogOpen}
        onClose={handleDialogClose}
      />

      <Card className="border shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">School Administrator</CardTitle>
            </div>
            <Badge
              variant={existingAdmin ? "default" : "secondary"}
              className={
                existingAdmin
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-none"
              }
            >
              {existingAdmin ? "Assigned" : "Not assigned"}
            </Badge>
          </div>
          <CardDescription>
            {existingAdmin
              ? "An administrator is already assigned to this school. Only one admin is allowed per school."
              : "No administrator account exists for this school. Create one below."}
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="pt-6">
          {existingAdmin ? (
            <AdminDisplay admin={existingAdmin} schoolId={schoolId} />
          ) : (
            <CreateAdminForm schoolId={schoolId} onCreated={handleAdminCreated} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
