// src/app/api/diagnose/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Known hats lookup
const brandMap: Record<string, string> = {
  ford: "Seasoned Ford Senior Master Technician",
  lincoln: "Seasoned Ford Senior Master Technician",
  chevrolet: "Seasoned GM Master Drivability Technician",
  chevy: "Seasoned GM Master Drivability Technician",
  gmc: "Seasoned GM Master Drivability Technician",
  buick: "Seasoned GM Master Drivability Technician",
  cadillac: "Seasoned GM Master Drivability Technician",
  toyota: "Seasoned Toyota Master Diagnostic Specialist",
  lexus: "Seasoned Toyota Master Diagnostic Specialist",
  honda: "Seasoned Honda/Acura Senior Master Technician",
  acura: "Seasoned Honda/Acura Senior Master Technician",
  nissan: "Seasoned Nissan Master Technician",
  infiniti: "Seasoned Nissan Master Technician",
  hyundai: "Seasoned Hyundai/Kia Senior Master Technician",
  kia: "Seasoned Hyundai/Kia Senior Master Technician",
  chrysler: "Seasoned Chrysler Master Technician",
  dodge: "Seasoned Chrysler Master Technician",
  jeep: "Seasoned Chrysler Master Technician",
  ram: "Seasoned Chrysler Master Technician",
};

// 🛠 Engine displacement → diesel mapping by brand
const engineDieselMap: Record<string, string[]> = {
  ford: ["6.0", "6.4", "6.7", "7.3"], // Power Stroke
  gmc: ["6.6", "3.0"], // Duramax
  chevrolet: ["6.6", "3.0"],
  cadillac: ["3.0"], // baby Duramax
  ram: ["5.9", "6.7"], // Cummins
  dodge: ["5.9", "6.7"],
  jeep: ["3.0"], // EcoDiesel
  vw: ["tdi"],
  audi: ["tdi"],
};

// 🔑 Keyword diesel catch-all
const dieselKeywords = ["duramax", "powerstroke", "cummins", "tdi", "ecodiesel", "diesel"];

function detectPersona(input: string): string {
  const lower = input.toLowerCase();

  let detectedBrand: string | null = null;
  for (const key of Object.keys(brandMap)) {
    if (lower.includes(key)) {
      detectedBrand = key;
      break;
    }
  }

  if (dieselKeywords.some((d) => lower.includes(d))) {
    if (detectedBrand) {
      return `${brandMap[detectedBrand]} (Diesel Specialist)`;
    }
    return "Seasoned Senior Master Diesel Technician (all brands)";
  }

  if (detectedBrand && engineDieselMap[detectedBrand]) {
    for (const displacement of engineDieselMap[detectedBrand]) {
      const regex = new RegExp(`\\b${displacement}\\b`);
      if (regex.test(lower)) {
        return `${brandMap[detectedBrand]} (Diesel Specialist)`;
      }
    }
  }

  if (detectedBrand) return brandMap[detectedBrand];

  return "Seasoned Independent Senior Master Diagnostic Technician (all makes & models)";
}

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const persona = detectPersona(input);

    const systemPrompt = `
You are Auto Repair AI, role-playing as a ${persona} with 30+ years experience.

Always output ONLY valid JSON with the following exact section titles.
Do not invent or rename sections. Every section must contain at least one item.

{
  "diagnoseData": [
    { "title": "Vehicle Context", "items": [] },
    { "title": "Theory & Operation", "items": [] },
    { "title": "TSB / Known Issues", "items": [] },
    { "title": "Diagnostic Steps", "items": [] },
    { "title": "Common Issues Seen", "items": [] },
    { "title": "Common Mistakes", "items": [] }
  ],
  "repairData": [
    { "title": "Repair Actions", "items": [] },
    { "title": "Service Data / Specs", "items": [] },
    { "title": "Costs & Time", "items": [] },
    { "title": "Difficulty & Skill", "items": [] }
  ],
  "verifyData": [
    { "title": "Post-Repair Verification", "items": [] },
    { "title": "Summary", "items": [] }
  ]
}

Rules:
1. Fastest checks first (injector pulse, fuses, grounds).  
2. Use IF/THEN diagnostic flow.  
3. Include brand- or engine-specific pattern failures.  
4. Add real-world shortcuts (wiggle test, load-test grounds, tap relays).  
5. Briefly explain WHY each step matters.  
6. Fuel system specs:  
   - Use **brand/engine-specific ranges** if known (e.g., Ford EcoBoost low-side 55–70 psi, high-side 500–3000 psi).  
   - If uncertain, explicitly state "specs vary by model — verify in OEM service info."  
   - Never default all GDI engines to the same numbers.  
7. TSBs: Always try to provide at least one real-world TSB, recall, or common service bulletin pattern for that brand/year.  
   - If none are known, say: "No widely documented TSBs known for this condition."  
8. Verification: beyond clearing codes (fuel trims, waveforms, hot restart).  
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.4,
    });

    let raw = completion.choices[0].message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) raw = match[0];

    let parsed;
    try {
      parsed = JSON.parse(raw);

      // 🛠 Normalize misplaced TSB section
      if (parsed.diagnoseData) {
        const tsbIndex = parsed.diagnoseData.findIndex(
          (s: any) => s.title?.toLowerCase().includes("tsb")
        );
        if (tsbIndex !== -1) {
          parsed.tsbData = parsed.tsbData || [];
          parsed.tsbData.push(parsed.diagnoseData[tsbIndex]);
          parsed.diagnoseData.splice(tsbIndex, 1);
        }
      }
    } catch (err) {
      console.error("❌ JSON parse failed:", raw);
      return NextResponse.json(
        { ok: false, error: "AI response parse error", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: parsed, persona });
  } catch (err) {
    console.error("Diagnose error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}