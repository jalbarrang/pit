export function nextThinkingLevel(levels: string[], current: string): string {
  if (levels.length === 0) return current;
  const idx = levels.indexOf(current);
  if (idx < 0) return levels[0]!;
  return levels[(idx + 1) % levels.length]!;
}
