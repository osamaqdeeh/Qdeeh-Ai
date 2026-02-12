import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Use Node.js runtime for middleware to support bcryptjs
export const runtime = 'nodejs';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.userType;

  // Admin routes protection
  if (nextUrl.pathname.startsWith("/admin-dashboard-secret")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/admin-signin", nextUrl));
    }
    if (userType !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Student dashboard routes
  if (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/learn")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
    if (userType !== "STUDENT") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Auth routes - redirect if already logged in
  if (nextUrl.pathname.startsWith("/auth/signin") || nextUrl.pathname.startsWith("/auth/signup")) {
    if (isLoggedIn) {
      if (userType === "ADMIN") {
        return NextResponse.redirect(new URL("/admin-dashboard-secret", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Admin signin - redirect if already logged in
  if (nextUrl.pathname.startsWith("/auth/admin-signin")) {
    if (isLoggedIn && userType === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard-secret", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin-dashboard-secret/:path*",
    "/dashboard/:path*",
    "/learn/:path*",
    "/auth/signin",
    "/auth/signup",
    "/auth/admin-signin",
  ],
};
