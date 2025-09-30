// src/data/mockData.ts

console.log("🔥 mockData.ts successfully loaded!");

// Diagnose Tab
export const diagnoseData = [
  {
    title: "Vehicle Context",
    color: "text-gray-300",
    items: [
      "2005 Ford F-250 6.0L Power Stroke Diesel",
      "Condition: Crank, no start when hot",
      "Known issues: high-pressure oil leaks, ICP/IPR failures, FICM voltage drops",
    ],
  },
  {
    title: "Theory & Operation",
    color: "text-purple-400",
    items: [
      "The 6.0L Power Stroke requires >500 psi injection control pressure (ICP) to enable injector firing.",
      "The Injection Pressure Regulator (IPR) controls oil pressure supplied to injectors.",
      "The FICM must maintain ~48V to properly energize injectors.",
      "Heat increases internal leakage and can cause marginal components to fail.",
    ],
  },
  {
    title: "Live Data (Key Readings)",
    color: "text-blue-400",
    items: [
      "ICP Pressure: ≥500 psi during crank",
      "IPR Duty Cycle: <15% at idle, 30–50% during crank/load",
      "FICM Voltage: 48V during crank",
      "Battery Voltage: >11.0V during crank",
    ],
  },
  {
    title: "Common Issues Seen",
    color: "text-green-400",
    items: [
      "Heat-soaked IPR valve causing pressure loss",
      "ICP sensor drift when hot",
      "High-pressure oil leaks (STC fitting, standpipes, dummy plugs)",
      "FICM voltage drop under crank",
      "Wiring/connector faults in engine harness",
    ],
  },
  {
    title: "Diagnostic Steps",
    color: "text-indigo-400",
    items: [
      "Step 1 — Scan for Codes: Document any DTCs (ICP, IPR, FICM, sync).",
      "Step 2 — Check ICP & IPR: Monitor ICP during crank, should be ≥500 psi; duty cycle should respond >30%.",
      "Step 3 — Test Fuel Pressure: Should be 45–70 psi KOEO and during crank.",
      "Step 4 — Inspect FICM: Verify voltage ≥48V under load.",
      "Step 5 — High-Pressure Oil Leak Test: Air test through IPR port if ICP low.",
    ],
  },
  {
    title: "Common Mistakes",
    color: "text-red-500",
    items: [
      "Throwing parts without verifying root cause",
      "Overlooking hot-only conditions during diagnosis",
      "Not load-testing power and grounds to FICM",
      "Failing to air test the HPO system when ICP low",
    ],
  },
];

// Repair Tab
export const repairData = [
  {
    title: "Repair Actions",
    color: "text-green-400",
    items: [
      "Replace IPR valve if sticking or slow to respond hot",
      "Replace ICP sensor if drift or low readings confirmed",
      "Repair/replace leaking standpipes, dummy plugs, or STC fitting",
      "Repair/replace FICM if voltage <46V under load",
      "Repair wiring/connector faults in ICP/IPR/FICM circuits",
    ],
  },
  {
    title: "Service Data / Specs",
    color: "text-blue-300",
    items: [
      "ICP Key On Engine Off: 0.2–0.25V",
      "ICP Cranking: ≥500 psi",
      "IPR Duty Cycle Idle: <15%",
      "FICM Logic: 12V; FICM Power: 48V",
      "Fuel Pressure: 45–70 psi",
    ],
  },
  {
    title: "Costs & Time",
    color: "text-yellow-400",
    items: [
      "ICP Sensor: $80–$150, 1–2 hours",
      "IPR Valve: $120–$200, 1–2 hours",
      "Standpipes/Dummy Plugs: $200–$400 parts + 4–6 hours labor",
      "STC Fitting Update: $250–$400, 6–8 hours labor",
      "FICM Repair/Replacement: $300–$700, 2–3 hours",
    ],
  },
  {
    title: "Difficulty & Skill",
    color: "text-pink-400",
    items: [
      "ICP/IPR replacement: Intermediate skill",
      "High-pressure oil leak repair: Advanced, requires air test kit",
      "FICM replacement: Intermediate electrical skills",
      "Harness diagnostics: Requires wiring diagrams + DVOM use",
    ],
  },
];

// Verify Tab
export const verifyData = [
  {
    title: "Post-Repair Verification",
    color: "text-teal-400",
    items: [
      "Verify hot restart multiple times after repair",
      "Confirm ICP ≥500 psi during crank, IPR duty cycle normal",
      "Confirm FICM ≥48V under load",
      "Check fuel pressure within spec",
      "Clear all codes, confirm none return",
    ],
  },
  {
    title: "Summary",
    color: "text-indigo-300",
    items: [
      "Hot no-start on 6.0L often traced to IPR, ICP, FICM, or HPO leaks.",
      "Systematic testing prevents unnecessary part replacement.",
      "Always confirm root cause with data and/or air test before repairs.",
    ],
  },
];

// TSB / Common Issues Tab
export const tsbData = [
  {
    title: "Common Issues Seen Online",
    color: "text-green-400",
    tags: [
      "All",
      "TSB/Recall",
      "Wiring/Harness",
      "Sensor/Component",
      "Software/Calibration",
    ],
    confidence: 65,
    items: [
      {
        issue: "FICM (Fuel Injection Control Module) voltage drop under hot conditions",
        details: [
          "The FICM is prone to heat-related failures on the 6.0L Power Stroke.",
          "Quick check: Measure FICM voltage during hot crank; should maintain 48V.",
          "Criteria: FICM Voltage ≥48V during crank.",
        ],
        source: "Ford TSB 06-22-3",
      },
      {
        issue: "ICP (Injection Control Pressure) sensor failure when hot",
        details: [
          "The ICP sensor can degrade over time due to heat, giving false pressure readings.",
          "Quick check: Check ICP sensor voltage KOEO (0.2–0.25V).",
          "Compare ICP live data during hot crank; should be ≥500 psi.",
        ],
        source: "Ford OE Service Manual",
      },
      {
        issue: "High-pressure oil leaks (STC fitting, standpipes, dummy plugs)",
        details: [
          "Leaks are common on 6.0L when hot due to expansion and worn seals.",
          "Perform high-pressure oil air test through IPR port if ICP low.",
        ],
        source: "Ford Service Bulletin (STC Fitting Update)",
      },
    ],
  },
];

// ✅ Debug: log everything being exported
console.log("📦 mockData exports:", {
  diagnoseData,
  repairData,
  verifyData,
  tsbData,
});