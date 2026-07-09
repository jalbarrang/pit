import { CliRenderEvents } from "@opentui/core";
import type { Selection } from "@opentui/core";
import { planCopy, copyNotice } from "../../domain/selection/index.ts";

export interface CopyClock { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void }
export interface CopyRenderer {
  on(event: string, listener: (...args: any[]) => void): unknown;
  off(event: string, listener: (...args: any[]) => void): unknown;
  copyToClipboardOSC52(text: string): boolean;
}
export interface CopyFooter { notice(text: string): void; clearNotice(): void }

export function bindSelectionCopy(renderer: CopyRenderer, footer: CopyFooter, clock: CopyClock = globalThis): () => void {
  let pending: unknown = null;
  const handler = (selection: Selection) => {
    const plan = planCopy(selection.getSelectedText());
    if (!plan) return;
    const copied = renderer.copyToClipboardOSC52(plan.text);
    footer.notice(copyNotice(plan, copied));
    if (pending) clock.clearTimeout(pending);
    pending = clock.setTimeout(() => footer.clearNotice(), 1500);
  };
  renderer.on(CliRenderEvents.SELECTION, handler);
  return () => { renderer.off(CliRenderEvents.SELECTION, handler); if (pending) clock.clearTimeout(pending); };
}
