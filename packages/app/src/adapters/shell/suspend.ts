export interface SuspendDeps {
  platform: string;
  renderer: { suspend(): void; resume(): void };
  proc: { once(signal: string, cb: () => void): void; kill(pid: number, signal: string): void; pid: number };
  notify(message: string): void;
}

export function suspendToBackground(deps: SuspendDeps): void {
  if (deps.platform === "win32") {
    deps.notify("Suspend is not supported on Windows");
    return;
  }
  deps.renderer.suspend();
  deps.proc.once("SIGCONT", () => deps.renderer.resume());
  deps.proc.kill(deps.proc.pid, "SIGTSTP");
}
