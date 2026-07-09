import { matchesKey } from "@pit/tui";

export class DoubleCtrlCExit {
  private last = 0;
  private readonly now: () => number;
  private readonly windowMs: number;

  constructor(now: () => number = Date.now, windowMs = 1000) {
    this.now = now;
    this.windowMs = windowMs;
  }

  input(data: string): "exit" | "armed" | "ignored" {
    if (!matchesKey(data, "ctrl+c")) return "ignored";
    const current = this.now();
    const result = this.last > 0 && current - this.last <= this.windowMs ? "exit" : "armed";
    this.last = current;
    return result;
  }
}
