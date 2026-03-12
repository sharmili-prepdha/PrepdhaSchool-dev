import {
  fetchUserById,
  fetchSubjects,
  fetchClasses,
  fetchSchoolClassSubjects,
  fetchUserClassSubjects,
} from "@/lib/admin/data";
import { getAuthUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import ClassSubjectMatrix from "@/components/admin/ClassSubjectMatrix";

export default async function SchoolAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return <div className="p-6">Invalid Login Id</div>;
  }

  const schoolId = session.schoolId;

  const user = await fetchUserById(userId);

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  const [subjects, classes, schoolClassSubjects, userClassSubjects] = await Promise.all([
    fetchSubjects(),
    fetchClasses(),
    fetchSchoolClassSubjects(schoolId),
    fetchUserClassSubjects(userId),
  ]);

  const selectedSubjectIds = userClassSubjects.map((ucs) => ucs.class_subject_id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-black">Login ID: {user.login_id}</p>
          <p className="text-sm text-gray-500">Role: {user.role}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Authorized Subjects</h2>

        <ClassSubjectMatrix
          classes={classes}
          subjects={subjects}
          schoolClassSubjects={schoolClassSubjects}
          selectedSubjectIds={selectedSubjectIds}
          userId={user.id}
          schoolId={schoolId}
        />
      </div>
    </div>
  );
}
