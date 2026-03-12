import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SchoolListItem from "@/components/SchoolListItem";
import Image from "next/image";
import { deleteSchool } from "@/features/schoolManagement/actions/actions";
import { Button } from "@/components/ui/button";
import { Plus, School, LogOut } from "lucide-react";

export default async function SchoolManagementLayout({ children }: { children: React.ReactNode }) {
  const schools = await prisma.school.findMany({
    //  Optimization - Only fetch fields needed for the sidebar list.
    // Excluding logo_dataurl significantly reduces payload size for long lists.
    select: {
      id: true,
      name: true,
      keyword: true,
      is_active: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* LEFT SIDEBAR */}
      <aside className="w-80 flex flex-col bg-card border-r shadow-sm z-10">
        {/* Sidebar Header - Fixed at top */}
        <div className="p-6 border-b shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden shrink-0">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight truncate">Super Admin</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">
                Management
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors gap-2"
            asChild
          >
            <Link href="/logout">
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </Button>
        </div>

        {/* Scrollable List Container - Fills remaining space */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
          <div className="p-4 space-y-1">
            {schools.map((school) => (
              <SchoolListItem key={school.id} school={school} deleteAction={deleteSchool} />
            ))}

            {schools.length === 0 && (
              <div className="text-center py-10 px-4">
                <School className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground italic">No schools found</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Button Footer - Pinned to bottom */}
        <div className="p-6 border-t bg-card/80 backdrop-blur-md shrink-0">
          <Button
            asChild
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 group"
          >
            <Link href="/superadmin/schoolManagement/new">
              <div className="bg-primary-foreground/20 p-1 rounded-md mr-2 group-hover:bg-primary-foreground/30 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              New School
            </Link>
          </Button>
        </div>
      </aside>

      {/* RIGHT PANEL CONTENT */}
      <main className="flex-1 h-full overflow-y-auto bg-muted/30">
        <div className="max-w-4xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
