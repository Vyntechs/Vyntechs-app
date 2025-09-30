// src/app/api/chats/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// 🔐 Helper – extract & verify userId from JWT
async function getUserIdFromRequest(): Promise<string | null> {
  try {
    const cookieStore = await cookies(); // ✅ await for Next.js 15
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}

// 📡 GET – fetch single chat
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userId = await getUserIdFromRequest();

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

    // 🔒 Parse messages safely
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

    const safeChat = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      messages: parsedMessages,
    };

    return NextResponse.json({ ok: true, chat: safeChat });
  } catch (err) {
    console.error("❌ Chat fetch error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}