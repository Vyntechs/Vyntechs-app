// src/app/api/chats/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// 🔐 Extract userId from JWT
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string;
  } catch {
    return null;
  }
}

// 📡 GET – fetch single chat
export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = context.params; // ✅ don’t type manually
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        messages: true,
        userId: true,
      },
    });

    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    let parsedMessages: any[] = [];
    try {
      const raw = typeof chat.messages === "string" ? chat.messages : "[]";
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsedMessages = parsed
          .filter(
            (m) =>
              m &&
              typeof m.role === "string" &&
              (typeof m.content === "string" || typeof m.content === "object")
          )
          .map((m) => ({ role: m.role, content: m.content }));
      }
    } catch {
      parsedMessages = [];
    }

    return NextResponse.json({
      ok: true,
      chat: {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        messages: parsedMessages,
      },
    });
  } catch (err) {
    console.error("❌ Chat fetch error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}