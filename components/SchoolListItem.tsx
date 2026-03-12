"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical } from "lucide-react";

type SchoolListItemProps = {
  school: {
    id: number;
    name: string;
  };
  deleteAction: (formData: FormData) => Promise<void> | void;
};

export default function SchoolListItem({ school, deleteAction }: SchoolListItemProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const params = useParams();
  const router = useRouter();

  const isActive = params.id === String(school.id);
  const isMatch = confirmText.trim().toLowerCase() === school.name.trim().toLowerCase();

  return (
    <>
      <div
        className={`relative flex items-center rounded-xl transition-all group border ${
          isActive ? "bg-blue-50 border-blue-100 shadow-sm" : "hover:bg-gray-50 border-transparent"
        }`}
      >
        <Link
          href={`/superadmin/schoolManagement/${school.id}`}
          className={`flex-1 p-3 text-sm font-medium transition-colors no-underline ${
            isActive ? "text-blue-700 font-semibold" : "text-gray-700"
          } truncate`}
        >
          {school.name}
        </Link>

        {/* Shadcn Dropdown Menu */}
        <div className="pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={
                  isActive
                    ? "text-blue-400 hover:text-blue-600"
                    : "text-gray-400 hover:text-gray-700"
                }
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/superadmin/schoolManagement/${school.id}?edit=true`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={() => setDeleteModalOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Shadcn Alert Dialog for Deletion */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. All associated data for{" "}
              <strong>{school.name}</strong> will be lost.
              <br />
              <br />
              Please type <strong>{school.name}</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${school.name}"`}
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
            <form
              action={async (formData) => {
                await deleteAction(formData);
                if (isActive) {
                  router.push("/superadmin/schoolManagement");
                }
                setDeleteModalOpen(false);
                setConfirmText("");
              }}
            >
              <input type="hidden" name="id" value={school.id} />
              <Button
                type="submit"
                variant="destructive"
                disabled={!isMatch}
                className="w-full sm:w-auto"
              >
                Delete School
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
