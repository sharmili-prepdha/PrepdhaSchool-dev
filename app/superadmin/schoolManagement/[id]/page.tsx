import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditSchoolForm from "../../../../components/superAdmin/schoolManagement/EditSchoolForm";
import AdminSection from "../../../../components/superAdmin/schoolManagement/AdminSection";
import { Role } from "@/app/generated/prisma/client";
import LogoView from "@/components/LogoView";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SchoolClassSubjectsMatrix from "@/components/school_class_subjects_matrix";
import { fetchClasses, fetchSubjects, fetchClassSubjects } from "@/lib/schoolManagement/data";
import { getAuthUser } from "@/lib/auth/auth";

export default async function SchoolDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getAuthUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const { edit } = await searchParams;

  const schoolId = Number(id);
  if (Number.isNaN(schoolId)) notFound();

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      school_class_subject: {
        include: {
          class_subject: true,
        },
      },
    },
  });

  if (!school) notFound();

  const classes = await fetchClasses();
  const subjects = await fetchSubjects();
  const classSubjects = await fetchClassSubjects();

  if (edit === "true") {
    return <EditSchoolForm school={school} />;
  }

  const adminResult = await prisma.user.findFirst({
    where: { school_id: schoolId, role: Role.admin },
    select: { id: true, name: true, role: true, login_id: true },
  });

  // Map 'name' to 'userName' to match the AdminSection component's expected type
  const existingAdmin = adminResult
    ? {
        id: adminResult.id,
        userName: adminResult.name,
        role: adminResult.role,
        loginId: adminResult.login_id,
      }
    : null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex gap-6 items-center">
          {school.logo_data_url && (
            <div className="shrink-0">
              <LogoView logoUrl={school.logo_data_url} />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {school.name}
            </h1>

            <div className="flex gap-2 items-center flex-wrap">
              <Badge variant="outline" className="font-mono">
                ID: {school.id}
              </Badge>
              <Badge variant="secondary">Keyword: {school.keyword}</Badge>
              <Badge
                variant={school.is_active ? "default" : "destructive"}
                className={school.is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                {school.is_active ? "Active" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Assign Subjects to School</h2>
        <SchoolClassSubjectsMatrix
          schoolId={schoolId}
          classes={classes}
          subjects={subjects}
          classSubjects={classSubjects}
          initialSchoolClassSubjects={school.school_class_subject.map((scs) => ({
            schoolId: scs.school_id,
            classSubjectId: scs.class_subject_id,
          }))}
        />
      </div>
      <AdminSection schoolId={schoolId} existingAdmin={existingAdmin} />
    </div>
  );
}
