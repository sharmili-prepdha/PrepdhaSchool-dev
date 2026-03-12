import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { getRequiredRoleForPath, isPublicPath } from "@/lib/auth/route-config";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRoleForPath(pathname);
  if (requiredRole === null) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({
    req,
    secret,
  });

  if (!token?.role) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token.mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", req.nextUrl.origin));
  }

  if (token.role !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
