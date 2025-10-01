import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function GET(req: NextRequest) {
  try {
    // 🔑 Grab cookie by name
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "No token" },
        { status: 401 }
      );
    }

    // 🔍 Verify JWT
    const { payload } = await jwtVerify(token, secret);

    // ✅ Return clean, predictable payload
    return NextResponse.json({
      ok: true,
      userId: payload.sub as string,
      email: payload.email ?? null,
      issuedAt: payload.iat ?? null,
      expiresAt: payload.exp ?? null,
    });
  } catch (err) {
    console.error("❌ /api/me error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}