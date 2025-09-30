import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) return null;

    const match = cookie.match(/auth_token=([^;]+)/);
    if (!match) return null;

    const token = match[1];
    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string; // user.id is stored in `sub`
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: no valid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title = "Test Chat", message = "Hello world" } = body;

    // Save Chat linked to the user
    const chat = await prisma.chat.create({
      data: {
        title,
        messages: JSON.stringify([{ role: "user", content: message }]),
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json({ ok: true, chat });
  } catch (err: any) {
    console.error("Test chat error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}