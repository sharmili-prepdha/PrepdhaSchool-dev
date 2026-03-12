import { auth, signOut } from "@/auth";
import { Bell, Search, LogOut, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export async function TopNav() {
  const session = await auth();

  let teacherName = "Teacher";
  if (session?.user?.userId && session?.user?.schoolId) {
    const userRow = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: { name: true },
    });
    if (userRow?.name) {
      teacherName = userRow.name;
    }
  }
  return (
    <header className="h-16 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div className="flex-1 max-w-xl flex items-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search across your classes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/50 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none ring-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{teacherName}</p>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Prepdha School</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{teacherName}</p>
                <p className="text-xs leading-none text-slate-500">ID: {session?.user?.userId || "Guest"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-slate-600 focus:text-slate-900">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center justify-start cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
