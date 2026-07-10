import { resolveGlobalAction } from "../../domain/keybindings/global-actions.ts";

export interface GlobalInputDeps {
  hasOverlay(): boolean;
  editorText(): string;
  matches: { matches(data: string, id: string): boolean };
  openLastImage(): void;
  page(delta: number): void;
  toggleTools(): void;
  exit(): void;
  abortIfStreaming(data: string): boolean;
  cycleModel(dir: 1 | -1): void;
  cycleThinking(): void;
  toggleThinking(): void;
  suspend(): void;
  externalEditor(): void;
  pasteImage(): void;
  followUp(): void;
  dequeue(): void;
  openModelSelector(): void;
  exitKeysInput(data: string): "exit" | "armed" | "ignored";
}

export function routeGlobalInput(deps: GlobalInputDeps, data: string): { consume: true } | undefined {
  if (deps.hasOverlay()) return undefined;
  if (data === "\u0019") { deps.openLastImage(); return { consume: true }; }
  const action = resolveGlobalAction(data, deps.matches, { editorEmpty: deps.editorText().length === 0 });
  if (action === "page-up" || action === "page-down") { deps.page(action === "page-up" ? -10 : 10); return { consume: true }; }
  if (action === "tools-expand") { deps.toggleTools(); return { consume: true }; }
  if (action === "exit-if-empty") { deps.exit(); return { consume: true }; }
  if (action === "model-next") { deps.cycleModel(1); return { consume: true }; }
  if (action === "model-prev") { deps.cycleModel(-1); return { consume: true }; }
  if (action === "thinking-cycle") { deps.cycleThinking(); return { consume: true }; }
  if (action === "thinking-toggle") { deps.toggleThinking(); return { consume: true }; }
  if (action === "suspend") { deps.suspend(); return { consume: true }; }
  if (action === "external-editor") { deps.externalEditor(); return { consume: true }; }
  if (action === "paste-image") { deps.pasteImage(); return { consume: true }; }
  if (action === "follow-up") { deps.followUp(); return { consume: true }; }
  if (action === "dequeue") { deps.dequeue(); return { consume: true }; }
  if (action === "model-select") { deps.openModelSelector(); return { consume: true }; }
  if (action === "interrupt" && deps.abortIfStreaming(data)) return { consume: true };
  const exit = deps.exitKeysInput(data); if (exit === "exit") deps.exit();
  return exit === "armed" ? { consume: true } : undefined;
}
