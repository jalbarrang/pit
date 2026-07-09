/** Extract one escape sequence starting at pos, or null. */
export function extractEscape(str: string, pos: number): { code: string; length: number } | null {
  if (pos >= str.length || str[pos] !== "\x1b") return null;
  const next = str[pos + 1];
  if (next === "[") return scanCsi(str, pos);
  if (next === "]") return scanTerminated(str, pos);
  if (next === "_") return scanTerminated(str, pos);
  return null;
}

function scanCsi(str: string, pos: number): { code: string; length: number } | null {
  let j = pos + 2;
  while (j < str.length && !/[A-Za-z@]/.test(str[j]!)) j += 1;
  if (j >= str.length) return null;
  return { code: str.slice(pos, j + 1), length: j + 1 - pos };
}

function scanTerminated(str: string, pos: number): { code: string; length: number } | null {
  let j = pos + 2;
  while (j < str.length) {
    if (str[j] === "\x07") return { code: str.slice(pos, j + 1), length: j + 1 - pos };
    if (str[j] === "\x1b" && str[j + 1] === "\\") return { code: str.slice(pos, j + 2), length: j + 2 - pos };
    j += 1;
  }
  return null;
}

export function parseOsc8(code: string): { url: string } | null | undefined {
  if (!code.startsWith("\x1b]8;")) return undefined;
  const bel = code.endsWith("\x07");
  const body = code.slice(4, bel ? -1 : -2);
  const sep = body.indexOf(";");
  if (sep === -1) return undefined;
  const url = body.slice(sep + 1);
  return url ? { url } : null;
}
