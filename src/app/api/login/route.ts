// src/app/api/login/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// Helper: decide cookie flags based on host + proto (works for LAN & prod)
function decideSecureAndSameSite(req: NextRequest) {
  const proto = (req.headers.get("x-forwarded-proto") || "http").toLowerCase();
  const host = (req.headers.get("host") || "").toLowerCase();

  const isLan =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host); // regex covers 172.16–31

  const isHttps = proto === "https";
  const secure = isHttps && !isLan;
  // Safari (esp. iOS) requires SameSite=None + Secure to send cookies on IP/local
  const sameSite: "lax" | "strict" | "none" = secure ? "strict" : "none";

  return { secure, sameSite };
}

export async function POST(req: NextRequest) {
  try {
    const { email, pattern } = await req.json();

    if (!email || !pattern) {
      return NextResponse.json(
        { ok: false, error: "Missing email or pattern" },
        { status: 400 }
      );
    }

    // Lookup user
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

    // Verify pattern
    const ok = await bcrypt.compare(pattern, user.vynLock.pattern);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Issue JWT
    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const res = NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
    });

    // Set cookie with smart flags
    const { secure, sameSite } = decideSecureAndSameSite(req);
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure,
      sameSite,
      priority: "high",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // no caching of login responses
    res.headers.set("Cache-Control", "no-store");

    return res;
  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}