export function resolveEditorCommand(env: { VISUAL?: string; EDITOR?: string }, platform: string): string[] {
  const raw = env.VISUAL || env.EDITOR;
  if (raw) return raw.split(" ").filter(Boolean);
  return platform === "win32" ? ["notepad"] : ["nano"];
}
