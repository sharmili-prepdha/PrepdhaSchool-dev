import Link from "next/link";

import { fetchSuperAdminStats, type SuperAdminStats } from "@/lib/superadmin/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

const statCards: {
  key: keyof SuperAdminStats;
  label: string;
  accent: string;
}[] = [
  { key: "totalSchools", label: "Total Schools", accent: "from-indigo-500 to-blue-500" },
  { key: "totalAdmins", label: "Total Admins", accent: "from-sky-500 to-cyan-500" },
  { key: "totalPrincipals", label: "Total Principals", accent: "from-emerald-500 to-teal-500" },
  { key: "totalTeachers", label: "Total Teachers", accent: "from-violet-500 to-purple-500" },
  { key: "totalStudents", label: "Total Students", accent: "from-pink-500 to-rose-500" },
  { key: "totalUsers", label: "All Users", accent: "from-slate-500 to-gray-600" },
];

export default async function SuperAdminDashboardPage() {
  const session = await getAuthUser();
  logger.info(`inside AdminPage , session value is ${JSON.stringify(session)}`);
  if (!session) redirect("/login");
  const stats = await fetchSuperAdminStats();

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          </div>
          <div>
            <Link href="/logout">
              <Button
                variant="destructive"
                className="flex w-full items-center justify-start gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Get a high-level overview of schools, admins, and users across the entire platform.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.key} className="relative overflow-hidden py-6">
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent}`}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold">{stats[card.key].toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="py-6">
          <CardHeader>
            <CardTitle>School Management</CardTitle>
            <CardDescription>
              View and manage all schools registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See every school, its status, and key details in a single place.
            </p>
            <Link
              href="/superadmin/schoolManagement"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to School Management
            </Link>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Review and monitor learning content used across schools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Inspect recent documents and how content is distributed between schools.
            </p>
            <Link
              href="/superadmin/contentManagement"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Content Management
            </Link>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader>
            <CardTitle>Page Metadata</CardTitle>
            <CardDescription>
              Manage textbooks, chapters, and pages for all schools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse and edit the content structure: schools, subjects, textbooks, chapters, and
              pages.
            </p>
            <Link
              href="/superadmin/contentMetadata"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Page Metadata
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
