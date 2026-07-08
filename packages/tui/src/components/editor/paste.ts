export interface PasteParse { paste: string | null; remaining: string }
const START = "\x1b[200~";
const END = "\x1b[201~";

export function parseBracketedPaste(data: string): PasteParse | null {
  const start = data.indexOf(START);
  if (start < 0) return null;
  const afterStart = data.slice(start + START.length);
  const end = afterStart.indexOf(END);
  if (end < 0) return { paste: afterStart, remaining: "" };
  return { paste: afterStart.slice(0, end), remaining: afterStart.slice(end + END.length) };
}

export function cleanPaste(text: string): string {
  const decoded = text.replace(/\x1b\[(\d+);5u/g, (match, code) => {
    const cp = Number(code);
    if (cp >= 97 && cp <= 122) return String.fromCharCode(cp - 96);
    if (cp >= 65 && cp <= 90) return String.fromCharCode(cp - 64);
    return match;
  });
  return decoded
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "    ")
    .split("")
    .filter((char) => char === "\n" || char.charCodeAt(0) >= 32)
    .join("");
}
