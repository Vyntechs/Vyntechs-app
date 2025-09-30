// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ If logged in and trying to access /login or /register → bounce home
  if (token && (pathname === "/login" || pathname === "/register")) {
    try {
      await jwtVerify(token, secret); // validate token
      return NextResponse.redirect(new URL("/", req.url));
    } catch {
      // invalid/expired token → let them stay
    }
  }

  // 🔒 Protect everything EXCEPT /login and /register
  const publicPaths = ["/login", "/register"];
  const isPublic = publicPaths.includes(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|static|favicon.ico).*)", 
    // protects all routes except Next.js internals, api, static, favicon
  ],
};