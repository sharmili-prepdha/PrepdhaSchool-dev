"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MoreVertical } from "lucide-react";
import NewUserAlert from "@/components/admin/NewUserAlert";
import { createUser, type CreateUserState } from "@/features/admin/actions/admin.action";
import { useActionState, useState, useMemo, useCallback } from "react";
import DeleteUserAlert from "./DeleteUserAlert";
import { SearchBar } from "./SearchBar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserEditDialog from "@/components/admin/UserEditDialog";

type User = {
  id: number;
  name: string | null;
  schoolId: number;
  role: string;
  loginId: string;
};

type SideNavProps = {
  users: User[];
  schoolName: string;
  schoolId: number;
  adminName: string;
  adminRole: string;
};

const initialState: CreateUserState = {
  success: false,
  message: "",
  error: "",
  newId: undefined,
  name: "",
  role: "",
  password: "",
};

export function SideNav({ users, schoolName, schoolId, adminName, adminRole }: SideNavProps) {
  const pathname = usePathname();
  const createUserWithSchool = createUser.bind(null, schoolId);
  const [state, formAction, isLoading] = useActionState(createUserWithSchool, initialState);
  const [open, setOpen] = useState(false);
  const [deleteUserState, setDeleteUserState] = useState<User | null>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [editUserState, setEditUserState] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams ? searchParams.get("q") : "";
  const handleNewUserAlertUpdate = useCallback(() => {
    setOpen(false);
  }, []);

  const filteredUsers = useMemo(() => {
    if (searchQuery) {
      return users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.loginId.toString().includes(searchQuery),
      );
    }
    return users;
  }, [searchQuery, users]);

  return (
    <div className="flex bg-gray-100 flex-col w-64 border-r h-screen sticky top-0 text-foreground">
      <div className="p-4 border-b flex flex-col gap-2">
        <h1 className="font-semibold text-lg truncate" title={schoolName}>
          {schoolName}
        </h1>
        <div className="flex justify-between items-center rounded-md bg-white px-3 py-2 text-sm border">
          <div>
            <p className="font-medium truncate">{adminName}</p>
            <p className="text-xs text-gray-500 capitalize">{adminRole}</p>
          </div>
          <div>
            <Link href="/logout" className="text-blue-600 underline block">
              <Button size="sm">Logout</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SearchBar key={pathname} />
        <nav className="grid gap-1 px-2">
          {filteredUsers.length != 0 ? (
            filteredUsers.map((user) => {
              const userPath = `/admin/users/${user.id}`;
              const href = searchQuery
                ? `${userPath}?q=${encodeURIComponent(searchQuery)}`
                : userPath;
              const isActive = pathname === userPath;
              return (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-2 group",
                    isActive && "border border-gray-500 shadow-xl/10 font-medium rounded-md",
                  )}
                >
                  <Link href={href} className="flex-1">
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start font-normal hover:bg-transparent",
                        isActive && "bg-transparent",
                      )}
                    >
                      {user.name || `User ${user.id}`}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => {
                      setMenuUser(user);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No users found</p>
          )}
        </nav>
      </div>

      <NewUserAlert state={state} onUpdate={handleNewUserAlertUpdate} />

      {deleteUserState && (
        <DeleteUserAlert
          open={!!deleteUserState}
          setOpen={(open) => {
            if (!open) setDeleteUserState(null);
          }}
          user={deleteUserState}
        />
      )}

      {editUserState && (
        <UserEditDialog
          open={!!editUserState}
          setOpen={(open: boolean) => {
            if (!open) setEditUserState(null);
          }}
          user={editUserState}
          schoolId={schoolId}
        />
      )}

      {menuUser && (
        <AlertDialog
          open={!!menuUser}
          onOpenChange={(open) => {
            if (!open) setMenuUser(null);
          }}
        >
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Manage user</AlertDialogTitle>
              <AlertDialogDescription>
                Choose an action for{" "}
                <span className="font-semibold text-foreground">
                  {menuUser.name || `User ${menuUser.id}`}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditUserState(menuUser);
                  setMenuUser(null);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteUserState(menuUser);
                  setMenuUser(null);
                }}
              >
                Delete
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mx-2 mb-2">
            Create User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>Add a new user to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
                <Label htmlFor="loginId" className="text-right">
                  Login Id (optional)
                </Label>
                <Input id="loginId" name="loginId" className="col-span-3" pattern="^[A-Za-z0-9_-]*$" title="Login ID must contain only letters and numbers" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
            </div>
            {state.error && <p className="text-red-500 text-sm mb-4">{state.error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
