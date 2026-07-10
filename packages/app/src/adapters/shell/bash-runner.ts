import type { RenderContext } from "@opentui/core";
import type { Component } from "@pit/tui";
import { BashExecutionComponent } from "../../components/index.ts";
import type { BashInvocation } from "../../domain/bash/index.ts";
import type { SessionGateway } from "../../domain/index.ts";
import { createTheme, type ThemeName } from "../../domain/theming/index.ts";
import type { Expandable } from "./shell-types.ts";

export interface BashComponentHandle {
  appendOutput(chunk: string): void;
  setComplete(exitCode: number | null | undefined, cancelled: boolean): void;
}

export interface BashRunnerDeps {
  hasBash(): boolean;
  execute(command: string, onChunk: (c: string) => void, excluded: boolean): Promise<{ exitCode?: number | null; cancelled: boolean }>;
  addComponent(command: string, excluded: boolean): BashComponentHandle;
  notify(text: string): void;
}

export class BashRunner {
  private deps: BashRunnerDeps;
  constructor(deps: BashRunnerDeps) { this.deps = deps; }
  run(invocation: BashInvocation): void {
    if (!this.deps.hasBash()) return this.deps.notify("Bash unavailable");
    const c = this.deps.addComponent(invocation.command, invocation.excluded);
    this.deps.execute(invocation.command, (chunk) => c.appendOutput(chunk), invocation.excluded)
      .then((r) => c.setComplete(r.exitCode, r.cancelled))
      .catch((e) => { c.setComplete(undefined, false); this.deps.notify(`Bash failed: ${e instanceof Error ? e.message : String(e)}`); });
  }
}

export interface ShellBashSurface {
  session(): SessionGateway | undefined;
  ctx(): RenderContext;
  theme(): ThemeName;
  registerExpandable(c: Expandable): void;
  addMessage(c: Component): void;
  notify(text: string): void;
}

export function createShellBashRunner(shell: ShellBashSurface): BashRunner {
  return new BashRunner({
    hasBash: () => !!shell.session()?.executeBash,
    execute: (cmd, onChunk, excluded) => shell.session()!.executeBash!(cmd, onChunk, { excludeFromContext: excluded }),
    addComponent: (cmd, excluded) => {
      const c = new BashExecutionComponent(shell.ctx(), cmd, excluded, createTheme(shell.theme()));
      shell.registerExpandable(c); shell.addMessage(c); return c;
    },
    notify: (t) => shell.notify(t),
  });
}
