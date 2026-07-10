export interface BashInvocation {
  command: string;
  excluded: boolean;
}

export function parseBashInput(text: string): BashInvocation | null {
  if (!text.startsWith("!")) return null;
  const excluded = text.startsWith("!!");
  const rest = text.slice(excluded ? 2 : 1).trim();
  if (rest.length === 0) return null;
  return { command: rest, excluded };
}

export function classifies(i: { bangs: number; excluded: number }): boolean {
  const parsed = parseBashInput(`${"!".repeat(i.bangs)}x`);
  return parsed !== null && (parsed.excluded ? 1 : 0) === i.excluded;
}
