// src/app/api/chats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// Read `auth_token` from the Cookie header
function getTokenFromReq(req: Request): string | null {
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  const part = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="));
  if (!part) return null;
  const value = part.slice("auth_token=".length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Verify JWT and return userId
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const token = getTokenFromReq(req);
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) ?? null;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}

// 📡 GET – list chats
export async function GET(req: Request) {
  console.log("📡 /api/chats GET called");

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  console.log(`📦 Returning ${chats.length} chats for userId=${userId}`);
  return NextResponse.json({ ok: true, chats });
}

// ✏️ POST – create a new chat
export async function POST(req: Request) {
  console.log("✏️ /api/chats POST called");

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { title, messages } = await req.json();
  console.log("📝 Creating chat:", { title, messagesLength: messages?.length });

  const chat = await prisma.chat.create({
    data: {
      title,
      messages: JSON.stringify(messages ?? []),
      userId,
    },
  });

  console.log(`✅ Chat created id=${chat.id}`);
  return NextResponse.json({ ok: true, chat });
}