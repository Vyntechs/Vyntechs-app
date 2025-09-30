// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function POST(req: Request) {
  try {
    const { email, pattern } = await req.json();
    if (!email || !pattern) {
      return NextResponse.json(
        { ok: false, error: "Missing email or pattern" },
        { status: 400 }
      );
    }

    // 🔐 Lookup user + VynLock pattern
    const user = await prisma.user.findUnique({
      where: { email },
      include: { vynLock: true },
    });

    if (!user?.vynLock) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(pattern, user.vynLock.pattern);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Create JWT
    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    // ✅ Return + set cookie
    const res = NextResponse.json({ ok: true, userId: user.id });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure only in prod
      sameSite: "lax", // prevents CSRF but works with redirects
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}