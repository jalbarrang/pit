export const MOD = { shift: 1, alt: 2, ctrl: 4, super: 8 } as const;
export const LOCK_MASK = 64 + 128;

export type ParsedKeyId = {
  key: string;
  modifier: number;
};

export const parseKeyId = (id: string): ParsedKeyId | null => {
  const parts = id.toLowerCase().split("+").filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  let modifier = 0;
  for (const part of parts) {
    if (part === "shift") modifier |= MOD.shift;
    else if (part === "alt") modifier |= MOD.alt;
    else if (part === "ctrl") modifier |= MOD.ctrl;
    else if (part === "super") modifier |= MOD.super;
  }
  return { key, modifier };
};

export const formatWithModifiers = (key: string, modifier: number): string | undefined => {
  const mod = modifier & ~LOCK_MASK;
  const names: string[] = [];
  if (mod & MOD.shift) names.push("shift");
  if (mod & MOD.ctrl) names.push("ctrl");
  if (mod & MOD.alt) names.push("alt");
  if (mod & MOD.super) names.push("super");
  return names.length ? `${names.join("+")}+${key}` : key;
};
