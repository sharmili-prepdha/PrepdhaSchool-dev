import type { Role } from "@/app/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    userId?: number;
    schoolId?: number;
    role?: Role;
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId: number;
      schoolId: number;
      role: Role;
      mustChangePassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    schoolId: number;
    role: Role;
    mustChangePassword: boolean;
  }
}