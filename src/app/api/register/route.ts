import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";   // ✅ fixed
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";  // only needed in login

const prisma = new PrismaClient();

function isValidPattern(p: string) {
  return /^\d+(?:-\d+)*$/.test(p) && p.length <= 100;
}

export async function POST(req: Request) {
  try {
    const { email, phone, pattern } = await req.json();

    if (!email || !pattern) {
      return NextResponse.json({ ok: false, error: "Missing email or pattern" }, { status: 400 });
    }
    if (!isValidPattern(pattern)) {
      return NextResponse.json({ ok: false, error: "Invalid pattern format" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(pattern, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        vynLock: { create: { pattern: hashed } },
      },
      include: { vynLock: true },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}