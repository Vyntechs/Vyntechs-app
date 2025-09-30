// src/utils/vynlock.ts
import bcrypt from "bcryptjs";

/**
 * VynLock utility
 *
 * Grid mapping (4x4 default):
 * 11 12 13 14
 * 15 16 17 18
 * 19 20 21 22
 * 23 24 25 26
 *
 * Operators (per swipe direction):
 * up    -> *
 * down  -> /
 * right -> +
 * left  -> -
 *
 * Exports:
 * - indexToValue(index, size = 4)
 * - patternToExpression(indices[], size = 4)
 * - evaluateExpressionStepwise(expressionParts[]) -> number
 * - hashPattern(indices[], size = 4, saltRounds = 10) -> Promise<string>
 * - verifyPattern(indices[], hash, size = 4) -> Promise<boolean>
 */

/** Map an index (0..size*size-1) -> double-digit value (11..26) */
export function indexToValue(index: number, size = 4): number {
  // base start 11 (can be changed later)
  const base = 11;
  return base + index;
}

/** Determine operator between two indices (based on grid movement) */
export function operatorBetween(prevIdx: number, nextIdx: number, size = 4): string {
  const prevRow = Math.floor(prevIdx / size);
  const prevCol = prevIdx % size;
  const nextRow = Math.floor(nextIdx / size);
  const nextCol = nextIdx % size;

  const dr = nextRow - prevRow;
  const dc = nextCol - prevCol;

  // Priority: vertical moves first (up/down), then horizontal (left/right)
  if (dr < 0) return "*"; // up => multiply
  if (dr > 0) return "/"; // down => divide
  if (dc > 0) return "+"; // right => add
  if (dc < 0) return "-"; // left => subtract

  // fallback (no movement): use '+' to avoid breaking
  return "+";
}

/** Build expression string and an array of parts (value/operator/value/...) */
export function patternToExpression(indices: number[], size = 4): { expression: string; parts: Array<number | string> } {
  if (!indices || indices.length === 0) {
    return { expression: "", parts: [] };
  }

  const parts: Array<number | string> = [];
  // first value
  const firstVal = indexToValue(indices[0], size);
  parts.push(firstVal);

  for (let i = 1; i < indices.length; i++) {
    const op = operatorBetween(indices[i - 1], indices[i], size);
    const val = indexToValue(indices[i], size);
    parts.push(op);
    parts.push(val);
  }

  // create readable infix expression
  const expression = parts.map((p) => (typeof p === "string" ? ` ${p} ` : p.toString())).join("");
  return { expression, parts };
}

/** Evaluate the parts stepwise (left-associative), avoids eval */
export function evaluateExpressionStepwise(parts: Array<number | string>): number {
  if (!parts || parts.length === 0) return 0;
  // start with first numeric
  let acc = Number(parts[0]) || 0;

  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i] as string;
    const next = Number(parts[i + 1]) || 0;

    switch (op) {
      case "+":
        acc = acc + next;
        break;
      case "-":
        acc = acc - next;
        break;
      case "*":
        acc = acc * next;
        break;
      case "/":
        // guard divide-by-zero: if next==0, small epsilon fallback
        acc = next === 0 ? acc / Number.EPSILON : acc / next;
        break;
      default:
        // unknown operator — treat as + for safety
        acc = acc + next;
    }
  }

  // Normalize result precision to avoid tiny floating noise
  if (!Number.isFinite(acc)) {
    // fallback if something weird happened
    return 0;
  }
  // round to 8 decimal places max
  return Math.round(acc * 1e8) / 1e8;
}

/** Convert a numeric result into a deterministic string before hashing */
function canonicalizeResult(result: number): string {
  // Use a fixed-format string to ensure consistent hashing
  // Include sign and up to 8 decimal places, strip trailing zeros
  const s = result.toFixed(8).replace(/\.?0+$/, "");
  return s;
}

/**
 * Hash the pattern:
 * - Build expression from indices
 * - Evaluate
 * - Canonicalize numeric result string
 * - Hash with bcrypt
 */
export async function hashPattern(indices: number[], size = 4, saltRounds = 10): Promise<{ hash: string; expression: string; value: number; canonical: string }> {
  const { expression, parts } = patternToExpression(indices, size);
  const value = evaluateExpressionStepwise(parts);
  const canonical = canonicalizeResult(value);
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(canonical, salt);
  return { hash, expression, value, canonical };
}

/** Verify pattern against stored bcrypt hash */
export async function verifyPattern(indices: number[], storedHash: string, size = 4): Promise<{ ok: boolean; expression: string; value: number; canonical: string }> {
  const { expression, parts } = patternToExpression(indices, size);
  const value = evaluateExpressionStepwise(parts);
  const canonical = canonicalizeResult(value);
  const ok = await bcrypt.compare(canonical, storedHash);
  return { ok, expression, value, canonical };
}

/** Helper: convert pattern string like "0-5-10-15" to indices array */
export function parsePatternString(patternStr: string): number[] {
  if (!patternStr || typeof patternStr !== "string") return [];
  return patternStr.split(/[-,]/).map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
}