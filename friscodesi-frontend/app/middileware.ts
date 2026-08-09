import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // Protect dashboard
  if (pathname.startsWith("/dashboard")) {

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Prevent admin from dashboard
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/messages", request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/admin/:path*"
  ],
};