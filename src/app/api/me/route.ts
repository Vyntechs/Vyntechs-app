import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: "No token" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      ok: true,
      email: payload.email || null,
      userId: payload.sub,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }
}