import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginService } from "@/features/auth/services/login.service";
import type { Role } from "@/app/generated/prisma/enums";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        schoolKeyword: { label: "School Keyword", type: "text" },
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.schoolKeyword || !credentials?.loginId || !credentials?.password) {
          return null;
        }
        const result = await loginService({
          schoolKeyword: String(credentials.schoolKeyword),
          loginId: String(credentials.loginId),
          password: String(credentials.password),
        });
        if (!result.success || !result.tokenPayload) {
          return null;
        }
        const { userId, schoolId, role } = result.tokenPayload;
        return {
          id: String(userId),
          name: null,
          email: null,
          userId,
          schoolId,
          role: role as Role,
          mustChangePassword: result.mustChangePassword,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user && "userId" in user) {
        token.userId = user.userId as number;
        token.schoolId = user.schoolId as number;
        token.role = user.role as Role;
        token.mustChangePassword = user.mustChangePassword as boolean;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && "userId" in token) {
        session.user.id = token.sub ?? "";
        session.user.userId = token.userId as number;
        session.user.schoolId = token.schoolId as number;
        session.user.role = token.role as Role;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "production",
});