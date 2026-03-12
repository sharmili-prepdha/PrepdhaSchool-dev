import type { Role } from "@/app/generated/prisma/enums";

/**
 * Path prefixes that require a specific role. First matching prefix wins.
 * Used by middleware for role-based route protection.
 */
export const ROLE_ROUTE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/student", role: "student" },
  { prefix: "/teacher", role: "teacher" },
  { prefix: "/principal", role: "principal" },
  { prefix: "/admin", role: "admin" },
  { prefix: "/superadmin", role: "superadmin" },
  { prefix: "/editor", role: "superadmin" },
];

/** Default path to redirect each role to (e.g. after login or from home). */
export const ROLE_DEFAULT_PATH: Record<Role, string> = {
  student: "/student",
  teacher: "/teacher",
  principal: "/principal",
  admin: "/admin",
  superadmin: "/superadmin",
};

/** Paths that are always allowed (no auth required). */
export const PUBLIC_PATHS = [
  "/login",
  "/unauthorized",
  "/change-password",
] as const;

/** Auth callback and API routes - allow through; NextAuth handles its own routes. */
export const AUTH_PATH_PREFIXES = ["/auth", "/api/auth"];

export function getRequiredRoleForPath(pathname: string): Role | null {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  for (const { prefix, role } of ROLE_ROUTE_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return role;
    }
  }
  return null;
}

export function isPublicPath(pathname: string): boolean {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (PUBLIC_PATHS.some((p) => normalized === p || normalized.startsWith(`${p}/`))) {
    return true;
  }
  if (AUTH_PATH_PREFIXES.some((p) => normalized.startsWith(p))) {
    return true;
  }
  return false;
}
