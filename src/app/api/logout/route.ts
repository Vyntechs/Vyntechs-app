// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only force secure in prod
    sameSite: "lax",
    path: "/",   // must match login cookie path
    maxAge: 0,   // expire immediately
  });

  return res;
}