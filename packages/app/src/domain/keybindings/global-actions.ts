export type GlobalAction = "interrupt" | "tools-expand" | "exit-if-empty" | "page-up" | "page-down" | "none";

interface KbMatcher {
  matches(data: string, id: string): boolean;
}

export function resolveGlobalAction(
  data: string,
  kb: KbMatcher,
  ctx: { editorEmpty: boolean },
): GlobalAction {
  if (kb.matches(data, "app.interrupt")) return "interrupt";
  if (kb.matches(data, "app.tools.expand")) return "tools-expand";
  if (ctx.editorEmpty && kb.matches(data, "app.exit")) return "exit-if-empty";
  if (data === "\u001b[5~") return "page-up";
  if (data === "\u001b[6~") return "page-down";
  return "none";
}
