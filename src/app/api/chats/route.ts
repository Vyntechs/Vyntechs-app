// src/app/api/chats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// 🔐 Helper – extract & verify userId from JWT
async function getUserIdFromRequest(): Promise<string | null> {
  try {
    const cookieStore = await cookies(); // ✅ await cookies()
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.warn("⚠️ No auth_token cookie found");
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}

// 📡 GET – list chats
export async function GET() {
  console.log("📡 /api/chats GET called");

  const userId = await getUserIdFromRequest();
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

  const userId = await getUserIdFromRequest();
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