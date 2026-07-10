import { decideSubmission } from "../../domain/compaction/index.ts";

export interface CompactionRunnerDeps {
  isCompacting(): boolean;
  canCompact(): boolean;
  compact(instructions?: string): Promise<unknown>;
  prompt(text: string): Promise<void>;
  notify(text: string): void;
}

export class CompactionRunner {
  private queue: string[] = [];
  private deps: CompactionRunnerDeps;
  constructor(deps: CompactionRunnerDeps) { this.deps = deps; }
  gate(text: string): boolean {
    const d = decideSubmission(this.deps.isCompacting());
    if (!d.queued) return false;
    this.queue.push(text);
    this.deps.notify("Queued until compaction finishes");
    return true;
  }
  flush(): void {
    const drained = this.queue; this.queue = [];
    drained.reduce((p, text) => p.then(() => this.deps.prompt(text)), Promise.resolve()).catch(() => {});
  }
  runCompact(instructions: string): void {
    if (!this.deps.canCompact()) return this.deps.notify("Compaction unavailable");
    void this.deps.compact(instructions.trim() || undefined).catch((e) => this.deps.notify(`Compaction failed: ${e instanceof Error ? e.message : String(e)}`));
  }
}
