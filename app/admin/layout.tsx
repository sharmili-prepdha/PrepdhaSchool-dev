import { getAuthUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { fetchUsers, fetchSchool } from "@/lib/admin/data";
import { SideNav } from "@/components/admin/SideNav";
import { logger } from "@/lib/logger";
import { Role } from "@/app/generated/prisma/enums";

export default async function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthUser();
  logger.info("This is inside AdminLayout");
  logger.info(`session value is ${JSON.stringify(session)}`);
  if (!session) redirect("/login");

  const [users, school] = await Promise.all([fetchUsers(session.schoolId), fetchSchool(session.schoolId)]);

  const nonAdminUsers = users.filter((u) => u.role !== Role.admin && u.role !== Role.superadmin);
  const adminUser = users.find((u) => u.id === session.userId);

  const plainUsers = nonAdminUsers.map((u) => ({
    id: u.id,
    name: u.name,
    schoolId: u.school_id,
    role: u.role,
    loginId: u.login_id
  }));

  return (
    <div className="flex h-screen bg-background">
      <SideNav
        users={plainUsers}
        schoolName={school?.name ?? "School Admin"}
        schoolId={school?.id ?? session.schoolId ?? 0}
        adminName={adminUser?.name ?? "Admin"}
        adminRole={adminUser?.role ?? Role.admin}
      />
      <main className="flex-1 relative overflow-y-auto">{children}</main>
    </div>
  );
}
