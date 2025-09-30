// src/app/api/chats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// helper to get userId from JWT cookie
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const cookie = req.headers.get("cookie") || "";
    console.log("🍪 Chats API cookie header:", cookie);

    const token = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    console.log("🔑 Chats API token:", token ? "present" : "missing");

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    console.log("✅ Chats API userId:", payload.sub);
    return payload.sub as string;
  } catch (err) {
    console.error("❌ Chats API JWT error:", err);
    return null;
  }
}

// GET – list chats
export async function GET(req: Request) {
  console.log("📡 /api/chats GET called");

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to access chats");
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  console.log(`📦 Returning ${chats.length} chats for userId: ${userId}`);

  return NextResponse.json({ ok: true, chats });
}

// POST – create a new chat
export async function POST(req: Request) {
  console.log("✏️ /api/chats POST called");

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to create chat");
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { title, messages } = await req.json();
  console.log("📝 Creating chat:", { title, messagesLength: messages?.length });

  const chat = await prisma.chat.create({
    data: {
      title,
      messages: JSON.stringify(messages), // ✅ stored as JSON string
      userId,
    },
  });

  console.log("✅ Chat created:", chat.id);

  return NextResponse.json({ ok: true, chat });
}