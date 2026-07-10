import type { RenderContext } from "@opentui/core";
import { CompactionSummaryComponent } from "../components/message/compaction-summary.ts";
import type { PitTheme } from "../domain/theming/index.ts";

type CompactionReason = "manual" | "threshold" | "overflow";
type CompactionResult = { summary: string; tokensBefore: number; estimatedTokensAfter?: number };

export type CompactionEvent =
  | { type: "compaction_start"; reason: CompactionReason }
  | {
      type: "compaction_end";
      reason: CompactionReason;
      result?: CompactionResult;
      aborted: boolean;
      willRetry: boolean;
      errorMessage?: string;
    };

type Expandable = { setExpanded(expanded: boolean): void };

export type CompactionShell = {
  tui: { ctx: RenderContext };
  chat: { addMessage(component: unknown): void };
  setWorkingMessage(message?: string): void;
  setWorkingVisible(visible: boolean): void;
  notifyExtension(text: string): void;
  registerExpandable(component: Expandable): void;
  flushCompactionQueue?(): void;
};

export type CompactionUi = { CompactionSummary?: typeof CompactionSummaryComponent };

export function handleCompactionEvent(
  shell: CompactionShell,
  theme: PitTheme,
  ui: CompactionUi,
  event: { type: string },
): boolean {
  if (event.type === "compaction_start") {
    const reason = (event as CompactionEvent & { type: "compaction_start" }).reason;
    shell.setWorkingMessage(reason === "manual" ? "Compacting context…" : "Auto-compacting…");
    shell.setWorkingVisible(true);
    return true;
  }
  if (event.type !== "compaction_end") return false;
  const end = event as CompactionEvent & { type: "compaction_end" };
  shell.setWorkingVisible(false);
  if (end.aborted) shell.notifyExtension("Compaction cancelled");
  else if (end.errorMessage) shell.notifyExtension(`Compaction failed: ${end.errorMessage}`);
  else if (end.result) {
    const Summary = ui.CompactionSummary ?? CompactionSummaryComponent;
    const component = new Summary(shell.tui.ctx, theme);
    component.setSummary(end.result.summary, end.result.tokensBefore, end.result.estimatedTokensAfter);
    shell.registerExpandable(component);
    shell.chat.addMessage(component);
  }
  shell.flushCompactionQueue?.();
  return true;
}
