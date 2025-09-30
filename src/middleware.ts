// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  // ✅ Allow public routes (login, register, static assets)
  const publicPaths = [
    "/login",
    "/register",
    "/api/login",
    "/api/register",
    "/favicon.ico",
    "/vyntechs-logo.png",
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ✅ Redirect unauthenticated users to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ Prevent logged-in users from hitting /login or /register again
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - API routes (handled separately, except login/register)
     * - Next.js internal paths (_next)
     * - Static files
     */
    "/((?!_next|api/auth|.*\\..*).*)",
  ],
};