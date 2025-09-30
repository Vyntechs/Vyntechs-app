// src/lib/vynlock.ts
// Utility to convert drawn pattern into a secure encoded string

// Example: 4x4 grid numbers are 11–44 (instead of 0–15)
export function encodePattern(pattern: number[]): string {
  return pattern.map((i) => {
    const row = Math.floor(i / 4) + 1; // 1–4
    const col = (i % 4) + 1; // 1–4
    return `${row}${col}`;
  }).join("-");
}

// Basic hash — in production swap for bcrypt or Argon2
export function hashPattern(pattern: number[]): string {
  const encoded = encodePattern(pattern);
  let hash = 0;
  for (let i = 0; i < encoded.length; i++) {
    hash = (hash << 5) - hash + encoded.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export function verifyPattern(input: number[], storedHash: string): boolean {
  return hashPattern(input) === storedHash;
}