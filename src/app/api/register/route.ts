import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function isValidPattern(p: string) {
  return /^\d+(?:-\d+)*$/.test(p) && p.length <= 100;
}

export async function POST(req: Request) {
  try {
    const { email, phone, pattern } = await req.json();

    if (!email || !pattern) {
      return NextResponse.json(
        { ok: false, error: "❌ Missing email or pattern" },
        { status: 400 }
      );
    }

    if (!isValidPattern(pattern)) {
      return NextResponse.json(
        { ok: false, error: "❌ Invalid pattern format" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "❌ Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(pattern, 10);

    console.log("🔑 Registering user with email:", email);
    console.log("Pattern (raw):", pattern);
    console.log("Pattern (hashed):", hashed);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        vynLock: { create: { pattern: hashed } },
      },
      include: { vynLock: true },
    });

    return NextResponse.json({
      ok: true,
      userId: user.id,
      message: "✅ User registered successfully",
    });
  } catch (err: any) {
    console.error("❌ Register error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error during registration" },
      { status: 500 }
    );
  }
}