import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const publicRoutes = ["/login", "/api/auth/login"];
const protectedRoutes = ["/dashboard", "/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const session = await getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

