// src/app/api/test-openai/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ secure: never exposed to client
});

export async function GET() {
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // fast & cheap test model
      messages: [{ role: "user", content: "Say hello from VynTechs!" }],
    });

    return NextResponse.json({ 
      ok: true, 
      response: chat.choices[0].message?.content 
    });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}