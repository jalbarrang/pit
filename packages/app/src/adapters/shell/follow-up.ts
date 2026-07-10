import { combineDequeued, formatPending, type QueuedMessages } from "../../domain/keybindings/message-queue.ts";

export interface FollowUpDeps {
  editorText(): string;
  setEditorText(text: string): void;
  isStreaming(): boolean;
  hasSession(): boolean;
  promptFollowUp(text: string): Promise<void>;
  submit(text: string): void;
  queued(): QueuedMessages;
  clearQueue(): QueuedMessages | undefined;
  showPending(lines: string[]): void;
}

export class FollowUpController {
  private deps: FollowUpDeps;
  constructor(deps: FollowUpDeps) { this.deps = deps; }
  followUp(): void {
    const text = this.deps.editorText().trim();
    if (!text) return;
    if (this.deps.hasSession() && this.deps.isStreaming()) {
      this.deps.setEditorText("");
      void this.deps.promptFollowUp(text).then(() => this.refresh());
    } else { this.deps.setEditorText(""); this.deps.submit(text); }
  }
  dequeue(): void {
    const q = this.deps.clearQueue();
    if (!q) return;
    this.deps.setEditorText(combineDequeued(q, this.deps.editorText()));
    this.refresh();
  }
  refresh(): void { this.deps.showPending(formatPending(this.deps.queued())); }
}
