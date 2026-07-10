export type GlobalAction =
  | "interrupt"
  | "tools-expand"
  | "exit-if-empty"
  | "page-up"
  | "page-down"
  | "model-next"
  | "model-prev"
  | "thinking-cycle"
  | "suspend"
  | "external-editor"
  | "paste-image"
  | "follow-up"
  | "dequeue"
  | "model-select"
  | "none";

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
  if (kb.matches(data, "app.model.cycleForward")) return "model-next";
  if (kb.matches(data, "app.model.cycleBackward")) return "model-prev";
  if (kb.matches(data, "app.thinking.cycle")) return "thinking-cycle";
  if (kb.matches(data, "app.suspend")) return "suspend";
  if (kb.matches(data, "app.editor.external")) return "external-editor";
  if (kb.matches(data, "app.clipboard.pasteImage")) return "paste-image";
  if (kb.matches(data, "app.message.followUp")) return "follow-up";
  if (kb.matches(data, "app.message.dequeue")) return "dequeue";
  if (kb.matches(data, "app.model.select")) return "model-select";
  if (data === "\u001b[5~") return "page-up";
  if (data === "\u001b[6~") return "page-down";
  return "none";
}
