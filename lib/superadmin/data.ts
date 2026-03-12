import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

export type SuperAdminStats = {
  totalSchools: number;
  totalAdmins: number;
  totalPrincipals: number;
  totalTeachers: number;
  totalStudents: number;
  totalUsers: number;
};

export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
  const [totalSchools, userCounts] = await Promise.all([
    prisma.school.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const roleMap = userCounts.reduce<Partial<Record<Role, number>>>((acc, item) => {
    acc[item.role] = item._count._all;
    return acc;
  }, {});

  const totalUsers = userCounts.reduce((sum, item) => sum + item._count._all, 0);
  const totalAdmins = roleMap[Role.admin] ?? 0;
  const totalPrincipals = roleMap[Role.principal] ?? 0;
  const totalTeachers = roleMap[Role.teacher] ?? 0;
  const totalStudents = roleMap[Role.student] ?? 0;

  return {
    totalSchools,
    totalAdmins,
    totalPrincipals,
    totalTeachers,
    totalStudents,
    totalUsers,
  };
}
