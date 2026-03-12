export const COOKIE_NAME = "session";

export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  PRINCIPAL: "principal",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const;

export const PUBLIC_ROUTES = [
  "/login",
  "/change-password",
  "/auth/redirect",
];
