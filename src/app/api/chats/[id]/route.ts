// src/app/api/chats/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

async function getUserFromToken(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string; // user.id
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ must be awaited
) {
  try {
    const { id } = await params;

    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        messages: true, // string column with JSON inside
        userId: true,
      },
    });

    if (!chat || chat.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    // 🔒 Safe parse messages into an array
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
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));
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
    console.error("Chat fetch error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}