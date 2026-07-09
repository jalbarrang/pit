import type { ColorValue, ThemeJson } from "./types.ts";

const ansi256ToHex = (value: number): string => {
  if (value < 16) throw new Error(`ANSI base colors unsupported: ${value}`);
  if (value >= 232) {
    const c = 8 + (value - 232) * 10;
    return hex(c, c, c);
  }
  const n = value - 16;
  const steps = [0, 95, 135, 175, 215, 255];
  return hex(steps[Math.floor(n / 36)], steps[Math.floor(n / 6) % 6], steps[n % 6]);
};

const hex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

export const normalizeHex = (value: ColorValue): string => {
  if (typeof value === "number") return ansi256ToHex(value);
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  throw new Error(`Invalid color value: ${String(value)}`);
};

export const resolveThemeColors = (json: ThemeJson): Record<string, string> => {
  const vars = json.vars ?? {};
  const resolve = (value: ColorValue, seen = new Set<string>()): string => {
    if (typeof value === "number" || value.startsWith("#")) return normalizeHex(value);
    if (seen.has(value)) throw new Error(`Theme color cycle: ${value}`);
    const next = vars[value] ?? json.colors[value];
    if (next === undefined) throw new Error(`Unknown theme color: ${value}`);
    return resolve(next, seen.add(value));
  };
  return Object.fromEntries(Object.entries(json.colors).map(([key, value]) => [key, resolve(value)]));
};
