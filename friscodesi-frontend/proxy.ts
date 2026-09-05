import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  const { pathname } = request.nextUrl;

  console.log("🔥 PROXY:", pathname);
  console.log("👤 User token:", !!token);
  console.log("👑 Admin token:", !!adminToken);

  /* =========================================
     ADMIN ROUTES
  ========================================= */

  if (pathname.startsWith("/admin")) {
    // Admin login is public
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // All other admin pages require adminToken
    if (!adminToken) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /* =========================================
     NORMAL USER DASHBOARD
  ========================================= */

  if (pathname.startsWith("/dashboard")) {
    // Dashboard still requires user login
    if (!token) {
      const loginUrl = new URL(
        "/login",
        request.url
      );

      loginUrl.searchParams.set(
        "redirect",
        pathname
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /* =========================================
     PUBLIC ROUTES
  ========================================= */

  /*
   * Categories and Frisco information are public.
   *
   * Visitors do NOT need to register or sign in
   * just to browse the website.
   */

  return NextResponse.next();
}


/* =========================================
   Protected Routes
========================================= */

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};